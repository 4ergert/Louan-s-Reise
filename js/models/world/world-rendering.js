import { createBloodSplatterParticles, createFireflyParticle, createFireflyParticles } from '../../world-effects.js';
import { drawBloodSplatter, drawBossLifeBar, drawFireflies, drawGameOverOverlay, drawVictoryOverlay, syncGameOverActions, syncVictoryActions } from '../../world-render-effects.js';
import { isTouchMobileDevice } from '../../mobile.js';

/**
 * @typedef {Object} FlyingPickupFrame
 * @property {number} progress
 * @property {number} drawX
 * @property {number} drawY
 */

/**
 * Rendering-related world mixin methods.
 */
export const worldRenderingMethods = {
  /**
   * Renders one full world frame in layer order.
   *
   * @returns {void}
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackgrounds();
    this.drawWorldLayer();
    this.drawFireflies();
    this.drawHudLayer();
    this.drawOverlayLayer();
    this.drawBloodSplatter();
  },

  /**
   * Draws all world-space gameplay objects using the active camera offset.
   *
   * @returns {void}
   */
  drawWorldLayer() {
    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.addObjectsToMap(this.thrownBones);
    this.addObjectsToMap(this.bossThrownSwords);
    this.addToMap(this.character);
    if (this.alia) this.addToMap(this.alia);
    if (this.liam) this.addToMap(this.liam);

    this.ctx.translate(-this.camera_x, 0);
  },

  /**
   * Draws HUD elements and animated pickups in screen space.
   *
   * @returns {void}
   */
  drawHudLayer() {
    this.addToMap(this.lifeBar);
    if (this.shouldShowBossLifeBar()) drawBossLifeBar(this.ctx, this.camera_x, this.bossLVL1, this.canvas);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.drawFlyingCoinPickups();
    this.drawFlyingBonePickups();
  },

  /**
   * Draws full-screen overlays such as game over, victory, and intro prompts.
   *
   * @returns {void}
   */
  drawOverlayLayer() {
    if (this.character.isDead) {
      this.bossLVL1?.setIdleState?.();
      if (!this.gameOverStartedAt) this.gameOverStartedAt = Date.now();
      this.playGameOverAudio();
      let showRetryPrompt = this.isGameOverRetryReady();

      syncGameOverActions(showRetryPrompt);
      drawGameOverOverlay(this.ctx, this.canvas, showRetryPrompt);
    } else {
      syncGameOverActions(false);
    }
    if (this.victoryOverlayVisible) drawVictoryOverlay(this.ctx, this.canvas, this.isVictoryPromptReady());
    else syncVictoryActions(false);
    if (this.endingLiamChaseActive) this.drawEndingLiamChaseBubble();
    this.drawActiveIntroBubble();
    this.drawBonePickupHint();
  },

  /**
   * Draws the temporary post-intro throw hint when configured by the current level.
   *
   * @returns {void}
   */
  drawBonePickupHint() {
    if (isTouchMobileDevice()) return;
    if (!this.openingIntroHintStartedAt || !this.openingIntroHintText) return;

    const elapsedTime = Date.now() - this.openingIntroHintStartedAt;

    if (elapsedTime >= this.openingIntroHintDuration) {
      this.openingIntroHintStartedAt = 0;
      return;
    }

    this.ctx.save();
    this.ctx.font = 'bold 28px Cinzel Decorative';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(255, 248, 234, 0.72)';
    this.ctx.strokeStyle = 'rgba(58, 36, 18, 0.45)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(this.openingIntroHintText, this.canvas.width / 2, this.canvas.height * 0.95);
    this.ctx.fillText(this.openingIntroHintText, this.canvas.width / 2, this.canvas.height * 0.95);
    this.ctx.restore();
  },

  /**
   * @returns {void}
   */
  drawEndingLiamChaseBubble() {
    if (!this.liam) return;

    let liamScreenX = this.liam.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 380, liamScreenX - 70));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(
      this.endingLiamChaseLines,
      this.endingLiamChaseStartedAt,
      this.endingLiamChaseTypeSpeed
    );

    this.drawIntroBubble({
      bubbleX,
      bubbleY,
      width: 360,
      height: 86,
      tailPoints: [
        [bubbleX + 70, bubbleY + 86],
        [bubbleX + 105, bubbleY + 86],
        [bubbleX + 76, bubbleY + 122],
      ],
      font: 'bold 16px Cinzel Decorative',
      textLines,
    });
  },

  /**
   * Draws the highest-priority active intro bubble.
   *
   * @returns {void}
   */
  drawActiveIntroBubble() {
    const activeIntroBubble = this.getActiveIntroBubble();
    if (!activeIntroBubble) return;

    activeIntroBubble();
  },

  /**
   * Returns the draw function for the currently active intro bubble.
   *
   * @returns {(() => void) | null}
   */
  getActiveIntroBubble() {
    const activeIntroType = this.getActiveIntroType?.();
    if (!activeIntroType) return null;

    const methodName = `draw${activeIntroType.charAt(0).toUpperCase()}${activeIntroType.slice(1)}IntroBubble`;
    return this[methodName]?.bind(this) ?? null;
  },

  /**
   * Draws parallax background objects for the current frame.
   *
   * @returns {void}
   */
  drawBackgrounds() {
    this.lvl.backgroundObjects.forEach((background) => {
      const offsetX = this.camera_x * background.parallaxFactor;

      this.ctx.save();
      this.ctx.translate(offsetX, 0);
      this.addToMap(background);
      this.ctx.restore();
    });
  },

  /**
   * Updates and draws the active blood splatter particles.
   *
   * @returns {void}
   */
  drawBloodSplatter() {
    if (this.bloodSplatterParticles.length === 0) return;

    this.bloodSplatterParticles = drawBloodSplatter(
      this.ctx,
      this.camera_x,
      this.bloodSplatterParticles,
      Date.now()
    );
  },

  /**
   * Updates and draws ambient fireflies for the visible world area.
   *
   * @returns {void}
   */
  drawFireflies() {
    let fireflyBoundaryY = this.getFireflyBoundaryY();

    if (fireflyBoundaryY <= 32) return;

    this.ensureFireflyParticles(fireflyBoundaryY);
    this.updateFireflyParticles(fireflyBoundaryY);
  },

  /**
   * Lazily creates the ambient firefly particle collection for the visible area.
   *
   * @param {number} fireflyBoundaryY
   * @returns {void}
   */
  ensureFireflyParticles(fireflyBoundaryY) {
    if (this.fireflyParticles.length > 0) return;

    this.fireflyParticles = createFireflyParticles(
      this.camera_x,
      this.canvas.width,
      fireflyBoundaryY,
      22
    );
  },

  /**
   * Updates and redraws the active firefly particle collection.
   *
   * @param {number} fireflyBoundaryY
   * @returns {void}
   */
  updateFireflyParticles(fireflyBoundaryY) {
    this.fireflyParticles = drawFireflies(
      this.ctx,
      this.camera_x,
      this.fireflyParticles,
      Date.now(),
      this.canvas.width,
      fireflyBoundaryY,
      createFireflyParticle
    );
  },

  /**
   * Computes the lower vertical spawn and movement boundary for fireflies.
   *
   * @returns {number}
   */
  getFireflyBoundaryY() {
    let visiblePlatforms = this.lvl.platformObjects.filter((platform) =>
      this.isHorizontallyVisible(platform.x, platform.width, 220)
    );

    if (visiblePlatforms.length === 0) return Math.floor(this.canvas.height * 0.72);

    return Math.max(...visiblePlatforms.map((platform) => platform.y - 18));
  },

  /**
   * Draws and advances coin pickups that fly toward the HUD counter.
   *
   * @returns {void}
   */
  drawFlyingCoinPickups() {
    this.flyingCoinPickups = this.drawFlyingPickups(
      this.flyingCoinPickups,
      this.coinsBar.x + this.coinsBar.width / 2,
      this.coinsBar.y + this.coinsBar.height / 2,
      () => this.coinsBar.addCoin(1)
    );
  },

  /**
   * Draws and advances bone pickups that fly toward the throwable HUD counter.
   *
   * @returns {void}
   */
  drawFlyingBonePickups() {
    this.flyingBonePickups = this.drawFlyingPickups(
      this.flyingBonePickups,
      this.throwableObjects.x + this.throwableObjects.width / 2,
      this.throwableObjects.y + this.throwableObjects.height / 2,
      () => this.throwableObjects.addBone(1)
    );
  },

  /**
   * Animates and draws pickups flying toward a HUD target.
   *
   * @param {Array<*>} pickups
   * @param {number} targetCenterX
   * @param {number} targetCenterY
   * @param {() => void} onPickupComplete
   * @returns {Array<*>}
   */
  drawFlyingPickups(pickups, targetCenterX, targetCenterY, onPickupComplete) {
    if (pickups.length === 0) return pickups;

    const now = Date.now();

    return pickups.filter((pickup) => {
      const { progress, drawX, drawY } = this.getFlyingPickupFrame(
        pickup,
        targetCenterX,
        targetCenterY,
        now
      );

      this.ctx.drawImage(pickup.img, drawX, drawY, pickup.width, pickup.height);

      if (progress < 1) return true;

      onPickupComplete();
      return false;
    });
  },

  /**
   * Computes the draw position and progress for a flying pickup frame.
   *
   * @param {{ startX: number, startY: number, startedAt: number, duration: number }} pickup
   * @param {number} targetCenterX
   * @param {number} targetCenterY
   * @param {number} now
   * @returns {FlyingPickupFrame}
   */
  getFlyingPickupFrame(pickup, targetCenterX, targetCenterY, now) {
    const progress = Math.min((now - pickup.startedAt) / pickup.duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    return {
      progress,
      drawX: pickup.startX + (targetCenterX - pickup.startX) * easedProgress,
      drawY: pickup.startY + (targetCenterY - pickup.startY) * easedProgress,
    };
  },

  /**
   * Queues a bone pickup for HUD flight animation.
   *
   * @param {{ img: CanvasImageSource, x: number, y: number, width: number, height: number }} bone
   * @returns {void}
   */
  queueFlyingBonePickup(bone) {
    this.flyingBonePickups.push(this.createFlyingPickup(bone));
  },

  /**
   * Queues a coin pickup for HUD flight animation.
   *
   * @param {{ img: CanvasImageSource, x: number, y: number, width: number, height: number }} coin
   * @returns {void}
   */
  queueFlyingCoinPickup(coin) {
    this.flyingCoinPickups.push(this.createFlyingPickup(coin));
  },

  /**
   * Creates the animation payload for a pickup flying into the HUD.
   *
   * @param {{ img: CanvasImageSource, x: number, y: number, width: number, height: number }} object
   * @returns {{ img: CanvasImageSource, startX: number, startY: number, width: number, height: number, startedAt: number, duration: number }}
   */
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

  /**
   * Spawns a burst of blood particles near the character toward the boss.
   *
   * @returns {void}
   */
  spawnBloodSplatter() {
    let characterArea = this.character.getCollisionArea();
    let originX = characterArea.x + characterArea.width / 2;
    let originY = characterArea.y + characterArea.height / 3;
    let direction = this.bossLVL1.x < this.character.x ? 1 : -1;
    let particles = createBloodSplatterParticles(originX, originY, direction, Date.now());

    this.bloodSplatterParticles.push(...particles);
  },

  /**
   * Determines whether the boss life bar should be visible.
   *
   * @returns {boolean}
   */
  shouldShowBossLifeBar() {
    return this.bossIntroTriggered && !this.isBossIntroActive() && this.bossLVL1 && !this.bossLVL1.isDead;
  },

  /**
   * Draws each visible object from the provided collection.
   *
   * @param {Array<{ x: number, y: number, width: number, height: number }>} objects
   * @returns {void}
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => {
      if (!this.isWorldObjectVisible(object)) return;

      this.addToMap(object);
    });
  },

  /**
   * Checks whether a world object intersects the visible viewport bounds.
   *
   * @param {{ x: number, y: number, width: number, height: number }} object
   * @returns {boolean}
   */
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

  /**
   * Draws one movable world object and applies horizontal flipping when needed.
   *
   * @param {{ imgDirectionChange?: boolean, x: number, width: number, draw: (ctx: CanvasRenderingContext2D) => void, drawCollisionArea: (ctx: CanvasRenderingContext2D) => void }} movableObject
   * @returns {void}
   */
  addToMap(movableObject) {
    if (movableObject.imgDirectionChange) this.flipImage(movableObject);
    movableObject.draw(this.ctx);
    movableObject.drawCollisionArea(this.ctx);
    if (movableObject.imgDirectionChange) this.ctx.restore();
  },

  /**
   * Mirrors the canvas context around the object's horizontal center.
   *
   * @param {{ x: number, width: number }} movableObject
   * @returns {void}
   */
  flipImage(movableObject) {
    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
  },
};
