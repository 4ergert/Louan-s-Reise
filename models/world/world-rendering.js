import { createBloodSplatterParticles } from '../../js/world-effects.js';
import { drawBloodSplatter, drawBossLifeBar, drawGameOverOverlay, drawVictoryOverlay } from '../../js/world-renderer.js';

export const worldRenderingMethods = {
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgrounds();
    this.drawWorldLayer();
    this.drawHudLayer();
    this.drawOverlayLayer();
    this.drawBloodSplatter();
  },

  drawWorldLayer() {
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.addObjectsToMap(this.thrownBones);
    this.addObjectsToMap(this.bossThrownSwords);
    this.addToMap(this.character);
    if (this.alia) this.addToMap(this.alia);

    this.ctx.translate(-this.camera_x, 0);
  },

  drawHudLayer() {
    this.addToMap(this.lifeBar);
    if (this.shouldShowBossLifeBar()) drawBossLifeBar(this.ctx, this.camera_x, this.bossLVL1, this.canvas);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.drawFlyingCoinPickups();
    this.drawFlyingBonePickups();
  },

  drawOverlayLayer() {
    if (this.character.isDead) {
      this.bossLVL1?.setIdleState?.();
      if (!this.gameOverStartedAt) this.gameOverStartedAt = Date.now();
      this.playGameOverAudio();
      drawGameOverOverlay(this.ctx, this.canvas, this.isGameOverRetryReady());
    }

    if (this.victoryOverlayVisible) {
      drawVictoryOverlay(this.ctx, this.canvas, this.isVictoryPromptReady());
    }

    this.drawActiveIntroBubble();
  },

  drawActiveIntroBubble() {
    if (this.isOpeningIntroActive()) {
      this.drawOpeningIntroBubble();
      return;
    }

    if (this.isBossIntroActive()) {
      this.drawBossIntroBubble();
      return;
    }

    if (this.isAliaIntroActive()) {
      this.drawAliaIntroBubble();
      return;
    }

    if (this.isCharacterResponseIntroActive()) {
      this.drawCharacterResponseIntroBubble();
    }
  },

  drawBackgrounds() {
    this.lvl.backgroundObjects.forEach((background) => {
      const offsetX = this.camera_x * background.parallaxFactor;

      this.ctx.save();
      this.ctx.translate(offsetX, 0);
      this.addToMap(background);
      this.ctx.restore();
    });
  },

  drawBloodSplatter() {
    if (this.bloodSplatterParticles.length === 0) return;

    this.bloodSplatterParticles = drawBloodSplatter(
      this.ctx,
      this.camera_x,
      this.bloodSplatterParticles,
      Date.now()
    );
  },

  drawFlyingCoinPickups() {
    this.flyingCoinPickups = this.drawFlyingPickups(
      this.flyingCoinPickups,
      this.coinsBar.x + this.coinsBar.width / 2,
      this.coinsBar.y + this.coinsBar.height / 2,
      () => this.coinsBar.addCoin(1)
    );
  },

  drawFlyingBonePickups() {
    this.flyingBonePickups = this.drawFlyingPickups(
      this.flyingBonePickups,
      this.throwableObjects.x + this.throwableObjects.width / 2,
      this.throwableObjects.y + this.throwableObjects.height / 2,
      () => this.throwableObjects.addBone(1)
    );
  },

  drawFlyingPickups(pickups, targetCenterX, targetCenterY, onPickupComplete) {
    if (pickups.length === 0) return pickups;

    let now = Date.now();

    return pickups.filter((pickup) => {
      let progress = Math.min((now - pickup.startedAt) / pickup.duration, 1);
      let easedProgress = 1 - Math.pow(1 - progress, 3);
      let drawX = pickup.startX + (targetCenterX - pickup.startX) * easedProgress;
      let drawY = pickup.startY + (targetCenterY - pickup.startY) * easedProgress;

      this.ctx.drawImage(pickup.img, drawX, drawY, pickup.width, pickup.height);

      if (progress < 1) return true;

      onPickupComplete();
      return false;
    });
  },

  queueFlyingBonePickup(bone) {
    this.flyingBonePickups.push(this.createFlyingPickup(bone));
  },

  queueFlyingCoinPickup(coin) {
    this.flyingCoinPickups.push(this.createFlyingPickup(coin));
  },

  createFlyingPickup(object) {
    return {
      img: object.img,
      startX: object.x + this.camera_x,
      startY: object.y,
      width: object.width,
      height: object.height,
      startedAt: Date.now(),
      duration: 350,
    };
  },

  spawnBloodSplatter() {
    let characterArea = this.character.getCollisionArea();
    let originX = characterArea.x + characterArea.width / 2;
    let originY = characterArea.y + characterArea.height / 3;
    let direction = this.bossLVL1.x < this.character.x ? 1 : -1;
    let particles = createBloodSplatterParticles(originX, originY, direction, Date.now());

    this.bloodSplatterParticles.push(...particles);
  },

  shouldShowBossLifeBar() {
    return this.bossIntroTriggered && !this.isBossIntroActive() && this.bossLVL1 && !this.bossLVL1.isDead;
  },

  addObjectsToMap(objects) {
    objects.forEach((object) => {
      if (!this.isWorldObjectVisible(object)) return;

      this.addToMap(object);
    });
  },

  isWorldObjectVisible(object) {
    return this.isHorizontallyVisible(object.x, object.width) && this.isVerticallyVisible(object.y, object.height);
  },

  isHorizontallyVisible(x, width, buffer = 160) {
    const viewportLeft = -this.camera_x - buffer;
    const viewportRight = -this.camera_x + this.canvas.width + buffer;

    return x + width >= viewportLeft && x <= viewportRight;
  },

  isVerticallyVisible(y, height, buffer = 160) {
    const viewportTop = -buffer;
    const viewportBottom = this.canvas.height + buffer;

    return y + height >= viewportTop && y <= viewportBottom;
  },

  addToMap(movableObject) {
    if (movableObject.imgDirectionChange) this.flipImage(movableObject);
    movableObject.draw(this.ctx);
    movableObject.drawCollisionArea(this.ctx);
    if (movableObject.imgDirectionChange) this.ctx.restore();
  },

  flipImage(movableObject) {
    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
  },
};
