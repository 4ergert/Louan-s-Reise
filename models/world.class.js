import { createBloodSplatterParticles } from '../js/world-effects.js';
import { drawBloodSplatter, drawBossLifeBar, drawGameOverOverlay, drawVictoryOverlay } from '../js/world-renderer.js';
import { createBoneBreakAudios, createBossMusicAudio, createCoinPickupAudio, createEvilLaughAudio, createGameOverAudio, createThrowableObjectPickupAudio, createThrowingAudio, playBackgroundAudio, playRandomVariantSound, playSoundEffect, stopBackgroundAudio } from '../js/audio.js';
import { Character } from './character/character.class.js';
import { Alia } from './Alia/alia.class.js';
import { CoinsBar } from './character/coins-bar.class.js';
import { LifeBar } from './character/life-bar.class.js';
import { Coins } from './objects/coin-object.class.js';
import { ThrowableObject } from './objects/throwable-objects.class.js';
import { BossSwordObject } from './objects/boss-sword-object.class.js';
import { EnvironmentObject } from './objects/environment-objects.class.js';
import { MushroomObject } from './objects/mushroom-object.class.js';
import { WorldIntros } from './world-intros.class.js';
import { SkeletonWarriorLVL1 } from './enemies/skeleton_warrior_1.class.js';
import { lvl_1 } from '../lvl/lvl_1.js';
import { isCollidingWithCharacter, isColliding, isCharacterWithinBossSlashRange } from '../js/colliding-objects.js';
import { isSpawning } from './character/char-movements.js';
import { die, startKnockback, startThrowingAnimation } from './character/char-animation-actions.js';

export class World extends WorldIntros {
  character = new Character();
  alia = null;
  lifeBar = new LifeBar();
  coinsBar = new CoinsBar();
  throwableObjects = new ThrowableObject(10, 100, true);
  thrownBones = [];
  bossThrownSwords = [];
  lvl = lvl_1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  throwInputLocked = false;
  bloodSplatterParticles = [];
  flyingCoinPickups = [];
  flyingBonePickups = [];
  standableObjectsCache = [];
  updateStepMs = 1000 / 60;
  frameRequestId = 0;
  lastFrameTime = 0;
  accumulatedTime = 0;
  isPaused = false;
  coinPickupAudio = createCoinPickupAudio();
  bonePickupAudio = createThrowableObjectPickupAudio();
  throwingAudio = createThrowingAudio();
  boneBreakAudios = createBoneBreakAudios();
  bossMusicAudio = createBossMusicAudio();
  evilLaughAudio = createEvilLaughAudio();
  gameOverAudio = createGameOverAudio();
  lastBoneBreakAudioIndex = -1;
  backgroundMusicAudio = null;
  bossMusicTriggered = false;
  bossIntroLaughPlayed = false;
  gameOverAudioPlayed = false;
  gameOverStartedAt = 0;
  gameOverRetryDelay = 3000;
  endingEscortActive = false;
  endingEscortCameraX = 0;
  victoryOverlayVisible = false;
  victoryOverlayStartedAt = 0;
  victoryPromptDelay = 3000;

  constructor(canvas, keyboard, backgroundMusicAudio = null, lvl = lvl_1) {
    super();
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.backgroundMusicAudio = backgroundMusicAudio;
    this.lvl = lvl;
    this.refreshStandableObjectsCache();
    this.applyLevelWorldSettings();
    this.setWorld();
    this.startLoop();
  }

  setWorld() {
    this.assignWorld(this.character);
    this.assignWorld(this.throwableObjects);
    this.assignWorldToAll(this.lvl.enemies);
    this.assignWorldToAll(this.lvl.environmentObjects);
  }

  get bossLVL1() {
    return this.lvl.enemies.find(enemy => enemy.isBoss);
  }

  isCharacterWithinBossSlashRange() {
    return isCharacterWithinBossSlashRange.call(this);
  }

  // Helper method to assign world reference to a drawable object and its children (if any)
  assignWorld(drawableObject) {
    if (drawableObject) drawableObject.world = this;
  }

  // Helper method to assign world reference to multiple objects at once
  assignWorldToAll(drawableObjects) {
    drawableObjects.forEach(drawableObject => this.assignWorld(drawableObject));
  }

  startLoop() {
    this.frameRequestId = requestAnimationFrame((timestamp) => this.runFrame(timestamp));
  }

  runFrame(timestamp) {
    if (!this.lastFrameTime) this.lastFrameTime = timestamp;

    const delta = Math.min(timestamp - this.lastFrameTime, 100);
    this.lastFrameTime = timestamp;
    this.accumulatedTime += delta;
    this.updateFrameState();

    while (this.accumulatedTime >= this.updateStepMs) {
      this.updateStep();
      this.accumulatedTime -= this.updateStepMs;
    }

    this.draw();
    this.frameRequestId = requestAnimationFrame((nextTimestamp) => this.runFrame(nextTimestamp));
  }

  updateFrameState() {
    this.updateOpeningIntro();
    this.updateBossIntro();
    this.handleIntroSkip();
  }

  updateStep() {
    this.updateObjects();
    this.updateCollisions();
  }

  updateObjects() {
    this.character.updateStep();
    this.alia?.updateStep();
    this.throwableObjects.updateStep();
    this.updateObjectGroup(this.lvl.enemies);
    this.updateObjectGroup(this.lvl.environmentObjects);
    this.updateObjectGroup(this.thrownBones);
    this.updateObjectGroup(this.bossThrownSwords);
  }

  updateObjectGroup(objects) {
    objects.forEach((object) => object.updateStep?.());
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgrounds();

    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.addObjectsToMap(this.thrownBones);
    this.addObjectsToMap(this.bossThrownSwords);

    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.lifeBar);
    if (this.shouldShowBossLifeBar()) drawBossLifeBar(this.ctx, this.camera_x, this.bossLVL1, this.canvas);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.drawFlyingCoinPickups();
    this.drawFlyingBonePickups();
    this.ctx.translate(this.camera_x, 0);
    this.addToMap(this.character);
    if (this.alia) this.addToMap(this.alia);

    this.ctx.translate(-this.camera_x, 0);

    if (this.character.isDead) {
      this.bossLVL1?.setIdleState?.();
      if (!this.gameOverStartedAt) this.gameOverStartedAt = Date.now();
      this.playGameOverAudio();
      drawGameOverOverlay(this.ctx, this.canvas, this.isGameOverRetryReady());
    }

    if (this.victoryOverlayVisible) {
      drawVictoryOverlay(this.ctx, this.canvas, this.isVictoryPromptReady());
    }

    if (this.isOpeningIntroActive()) {
      this.drawOpeningIntroBubble();
    }

    if (this.isBossIntroActive()) {
      this.drawBossIntroBubble();
    }

    if (this.isAliaIntroActive()) {
      this.drawAliaIntroBubble();
    }

    if (this.isCharacterResponseIntroActive()) {
      this.drawCharacterResponseIntroBubble();
    }

    this.drawBloodSplatter();
  }

  // Draw backgrounds with parallax effect
  drawBackgrounds() {
    this.lvl.backgroundObjects.forEach(background => {
      const offsetX = this.camera_x * background.parallaxFactor;

      this.ctx.save();
      this.ctx.translate(offsetX, 0);
      this.addToMap(background);
      this.ctx.restore();
    });
  }

  drawBloodSplatter() {
    if (this.bloodSplatterParticles.length === 0) return;

    this.bloodSplatterParticles = drawBloodSplatter(
      this.ctx,
      this.camera_x,
      this.bloodSplatterParticles,
      Date.now()
    );
  }

  drawFlyingCoinPickups() {
    if (this.flyingCoinPickups.length === 0) return;

    let now = Date.now();
    let targetCenterX = this.coinsBar.x + this.coinsBar.width / 2;
    let targetCenterY = this.coinsBar.y + this.coinsBar.height / 2;

    this.flyingCoinPickups = this.flyingCoinPickups.filter((pickup) => {
      let progress = Math.min((now - pickup.startedAt) / pickup.duration, 1);
      let easedProgress = 1 - Math.pow(1 - progress, 3);
      let drawX = pickup.startX + (targetCenterX - pickup.startX) * easedProgress;
      let drawY = pickup.startY + (targetCenterY - pickup.startY) * easedProgress;

      this.ctx.drawImage(pickup.img, drawX, drawY, pickup.width, pickup.height);

      if (progress < 1) return true;

      this.coinsBar.addCoin(1);
      return false;
    });
  }

  drawFlyingBonePickups() {
    if (this.flyingBonePickups.length === 0) return;

    let now = Date.now();
    let targetCenterX = this.throwableObjects.x + this.throwableObjects.width / 2;
    let targetCenterY = this.throwableObjects.y + this.throwableObjects.height / 2;

    this.flyingBonePickups = this.flyingBonePickups.filter((pickup) => {
      let progress = Math.min((now - pickup.startedAt) / pickup.duration, 1);
      let easedProgress = 1 - Math.pow(1 - progress, 3);
      let drawX = pickup.startX + (targetCenterX - pickup.startX) * easedProgress;
      let drawY = pickup.startY + (targetCenterY - pickup.startY) * easedProgress;

      this.ctx.drawImage(pickup.img, drawX, drawY, pickup.width, pickup.height);

      if (progress < 1) return true;

      this.throwableObjects.addBone(1);
      return false;
    });
  }

  queueFlyingBonePickup(bone) {
    this.flyingBonePickups.push({
      img: bone.img,
      startX: bone.x + this.camera_x,
      startY: bone.y,
      width: bone.width,
      height: bone.height,
      startedAt: Date.now(),
      duration: 350,
    });
  }

  queueFlyingCoinPickup(coin) {
    this.flyingCoinPickups.push({
      img: coin.img,
      startX: coin.x + this.camera_x,
      startY: coin.y,
      width: coin.width,
      height: coin.height,
      startedAt: Date.now(),
      duration: 350,
    });
  }

  spawnBloodSplatter() {
    let characterArea = this.character.getCollisionArea();
    let originX = characterArea.x + characterArea.width / 2;
    let originY = characterArea.y + characterArea.height / 3;
    let direction = this.bossLVL1.x < this.character.x ? 1 : -1;
    let particles = createBloodSplatterParticles(originX, originY, direction, Date.now());

    this.bloodSplatterParticles.push(...particles);
  }

  spawnSkeletonWarriorFromBoss() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const skeletonWarrior = new SkeletonWarriorLVL1();
    const spawnDirection = this.character.x < this.bossLVL1.x ? -1 : 1;
    const spawnX = this.bossLVL1.x + (spawnDirection < 0 ? 70 : 100);
    const spawnY = this.bossLVL1.y + 180;

    this.assignWorld(skeletonWarrior);
    skeletonWarrior.launchFromBoss(spawnDirection, spawnX, spawnY);
    this.lvl.enemies.push(skeletonWarrior);
  }

  spawnBossSwordBoomerang() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const throwDirection = this.character.x < this.bossLVL1.x ? -1 : 1;
    const swordWidth = 240;
    const swordHandCenterX = this.bossLVL1.x + (throwDirection < 0 ? 120 : 380);
    const swordX = swordHandCenterX - swordWidth / 2;
    const swordY = this.bossLVL1.y + 190;
    const sword = new BossSwordObject(swordX, swordY, throwDirection);

    this.assignWorld(sword);
    this.bossThrownSwords.push(sword);
  }

  updateOpeningIntro() {
    if (!this.openingIntroLines.length) {
      this.openingIntroCompleted = true;
      return;
    }

    if (this.openingIntroTriggered || this.character.isDead || isSpawning(this.character)) return;

    this.openingIntroTriggered = true;
    this.isPaused = true;
    this.openingIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.openingIntroTimeout = setTimeout(() => {
      this.finishOpeningIntro();
    }, this.openingIntroDuration);
  }

  updateBossIntro() {
    if (!this.openingIntroCompleted || this.bossIntroTriggered || this.character.isDead) return;
    if (!this.bossLVL1) return;
    if (!this.isBossFullyVisible() || !this.isCharacterNearBoss()) return;

    this.bossIntroTriggered = true;
    this.isPaused = true;
    this.bossIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.bossIntroTimeout = setTimeout(() => {
      this.finishBossIntro();
    }, this.bossIntroDuration);
  }

  isBossFullyVisible() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    return bossScreenX >= 0 && bossScreenX + this.bossLVL1.width <= this.canvas.width + 100;
  }

  isCharacterNearBoss() {
    let characterRightEdge = this.character.x + this.character.width;
    return this.bossLVL1.x - characterRightEdge <= 400;
  }

  shouldShowBossLifeBar() {
    return this.bossIntroTriggered && !this.isBossIntroActive() && this.bossLVL1 && !this.bossLVL1.isDead;
  }

  addObjectsToMap(objects) {
    objects.forEach(object => {
      if (!this.isWorldObjectVisible(object)) return;

      this.addToMap(object);
    });
  }

  isWorldObjectVisible(object) {
    return this.isHorizontallyVisible(object.x, object.width) && this.isVerticallyVisible(object.y, object.height);
  }

  isHorizontallyVisible(x, width, buffer = 160) {
    const viewportLeft = -this.camera_x - buffer;
    const viewportRight = -this.camera_x + this.canvas.width + buffer;

    return x + width >= viewportLeft && x <= viewportRight;
  }

  isVerticallyVisible(y, height, buffer = 160) {
    const viewportTop = -buffer;
    const viewportBottom = this.canvas.height + buffer;

    return y + height >= viewportTop && y <= viewportBottom;
  }

  addToMap(movableObject) {
    if (movableObject.imgDirectionChange) this.flipImage(movableObject);
    movableObject.draw(this.ctx);
    movableObject.drawCollisionArea(this.ctx);
    if (movableObject.imgDirectionChange) this.ctx.restore();
  }

  flipImage(movableObject) {
    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
  }

  updateCollisions() {
    if (this.isPaused) return;

    this.updateEndingEscort();
    const standableObjects = this.getStandableObjects();

    this.landOnNearbyPlatforms(this.character, standableObjects);
    this.landOnNearbyPlatforms(this.alia, standableObjects, (alia) => {
      alia.hasLanded = true;
    });

    this.lvl.enemies.forEach((enemy) => {
      if (enemy.isBoss || enemy.isDying || enemy.isDead) return;

      this.landOnNearbyPlatforms(enemy, standableObjects);
    });

    this.lvl.environmentObjects.forEach((object) => {
      if (!object.affectedByPlatforms) return;

      this.landOnNearbyPlatforms(object, standableObjects, (affectedObject) => {
        affectedObject.speedX = 0;
        affectedObject.isCollectible = true;
      });
    });

    this.updateChestRewards();
    this.unlockTouchedObjects();
    this.blockCharacterBySolidObjects();
    this.collectCoins();
    this.collectChestRewards();
    this.collectBones();
    this.checkBossMusicTrigger();
    this.checkAliaIntroTrigger();
    this.handleCharacterFallDeath();
    this.handleEnemyFallDeath();

    if (this.character.isDying || this.character.isDead) return;

    this.handleThrowInput();
    this.updateThrownBones();
    this.updateBossThrownSwords();
    this.updateBossAttackState();

    let stompedEnemy = this.lvl.enemies.find(enemy =>
      !enemy.isBoss &&
      !enemy.isDying && !enemy.isDead &&
      this.character.isColliding(enemy) && this.isStompingEnemy(enemy)
    );

    if (stompedEnemy) {
      this.bounceOffEnemy(stompedEnemy);
      this.handleEnemyDefeat(stompedEnemy);
      return;
    }

    this.lvl.enemies.forEach(enemy => {
      if (enemy.isDying || enemy.isDead) return;
      if (enemy.isBoss) return;

      if (this.character.isColliding(enemy) && !this.character.isHurt()) {
        startKnockback(this.character, enemy.x + enemy.width / 2);
        this.character.hit();
      }
    });
  }

  getCharacterFallDeathY() {
    return this.canvas.height;
  }

  isCharacterInDeathFallZone() {
    let fallDeathStartX = this.lvl.worldSettings?.fallDeathStartX;

    return typeof fallDeathStartX === 'number' && this.character.x >= fallDeathStartX;
  }

  handleCharacterFallDeath() {
    if (this.character.isDead) return;
    if (!this.character.shouldKeepFallingIntoAbyss()) return;
    if (this.character.y < this.getCharacterFallDeathY()) return;

    die(this.character);
    this.character.isDying = false;
    this.character.isDead = true;
    this.character.vcY = -6;
  }

  handleEnemyFallDeath() {
    this.lvl.enemies.forEach((enemy) => {
      if (enemy.isBoss || enemy.isDying || enemy.isDead) return;
      if (typeof enemy.shouldKeepFallingIntoAbyss !== 'function') return;
      if (!enemy.shouldKeepFallingIntoAbyss()) return;
      if (enemy.y < this.getCharacterFallDeathY()) return;

      let dyingDuration = enemy.die();

      setTimeout(() => {
        this.removeEnemy(enemy);
      }, dyingDuration);
    });
  }

  getStandableObjects() {
    return this.standableObjectsCache;
  }

  refreshStandableObjectsCache() {
    this.standableObjectsCache = [
      ...(this.lvl.platformObjects ?? []),
      ...(this.lvl.solidObjects ?? []),
    ];
  }

  getNearbyStandableObjects(target, standableObjects, margin = 120) {
    if (!target) return [];

    let collisionArea = target.getCollisionArea?.() ?? target;
    let minX = collisionArea.x - margin;
    let maxX = collisionArea.x + collisionArea.width + margin;

    return standableObjects.filter((platform) => {
      let platformArea = platform.getCollisionArea();

      return platformArea.x + platformArea.width >= minX && platformArea.x <= maxX;
    });
  }

  landOnNearbyPlatforms(target, standableObjects, onLand = null) {
    if (!target) return;
    if (typeof target.isLandingOn !== 'function' || typeof target.landOn !== 'function') return;

    this.getNearbyStandableObjects(target, standableObjects).forEach((platform) => {
      if (!target.isLandingOn(platform)) return;

      target.landOn(platform);
      onLand?.(target, platform);
    });
  }

  blockCharacterBySolidObjects() {
    (this.lvl.solidObjects ?? []).forEach((solidObject) => {
      if (!this.character.isColliding(solidObject)) return;
      if (this.character.isLandingOn(solidObject)) return;
      if (this.shouldIgnoreSolidCollisionFromBelow(solidObject)) return;

      this.resolveCharacterSolidCollision(solidObject);
    });
  }

  resolveCharacterSolidCollision(solidObject) {
    let characterArea = this.character.getCollisionArea();
    let solidArea = solidObject.getCollisionArea();
    let overlaps = this.getCharacterSolidOverlaps(characterArea, solidArea);

    if (Math.min(overlaps.top, overlaps.bottom) < Math.min(overlaps.left, overlaps.right)) {
      this.resolveCharacterVerticalSolidCollision(solidArea, characterArea, overlaps);
      return;
    }

    this.resolveCharacterHorizontalSolidCollision(solidArea, characterArea, overlaps);
  }

  getCharacterSolidOverlaps(characterArea, solidArea) {
    return {
      left: characterArea.x + characterArea.width - solidArea.x,
      right: solidArea.x + solidArea.width - characterArea.x,
      top: characterArea.y + characterArea.height - solidArea.y,
      bottom: solidArea.y + solidArea.height - characterArea.y,
    };
  }

  resolveCharacterVerticalSolidCollision(solidArea, characterArea, overlaps) {
    let characterOffsetY = characterArea.y - this.character.y;

    if (overlaps.top < overlaps.bottom) {
      this.character.y = solidArea.y - characterArea.height - characterOffsetY;
      this.character.vcY = 0;
      return;
    }

    this.character.y = solidArea.y + solidArea.height - characterOffsetY;
    if (this.character.vcY > 0) this.character.vcY = 0;
  }

  resolveCharacterHorizontalSolidCollision(solidArea, characterArea, overlaps) {
    let characterOffsetX = characterArea.x - this.character.x;

    if (overlaps.left < overlaps.right) {
      this.character.x = solidArea.x - characterArea.width - characterOffsetX;
      return;
    }

    this.character.x = solidArea.x + solidArea.width - characterOffsetX;
  }

  shouldIgnoreSolidCollisionFromBelow(solidObject) {
    if (!solidObject.ignoreCollisionFromBelow) return false;

    let characterArea = this.character.getCollisionArea();
    let solidArea = solidObject.getCollisionArea();
    let characterCenterY = characterArea.y + characterArea.height / 2;
    let solidCenterY = solidArea.y + solidArea.height / 2;

    return characterCenterY >= solidCenterY;
  }

  unlockTouchedObjects() {
    (this.lvl.solidObjects ?? []).forEach((solidObject) => {
      if (!solidObject.unlockImagePath || solidObject.isUnlocked) return;
      if (!this.character.isColliding(solidObject)) return;
      if (this.shouldIgnoreSolidCollisionFromBelow(solidObject)) return;

      if (solidObject.unlock()) this.spawnUnlockReward(solidObject);
    });
  }

  spawnUnlockReward(solidObject) {
    let rewardWidth = solidObject.rewardWidth ?? 60;
    let rewardHeight = solidObject.rewardHeight ?? 60;
    let rewardX = solidObject.x + solidObject.width + (solidObject.rewardOffsetX ?? 10);
    let rewardY = solidObject.y + (solidObject.rewardOffsetY ?? solidObject.height / 2 - rewardHeight / 2);
    let reward = new MushroomObject(rewardX, rewardY, rewardWidth, rewardHeight);

    this.assignWorld(reward);
    reward.applyGravity();
    reward.vcY = solidObject.rewardLaunchSpeed ?? reward.launchSpeed;
    reward.speedX = solidObject.rewardSpeedX ?? reward.speedX;
    this.lvl.environmentObjects.push(reward);
  }

  updateChestRewards() {
    this.lvl.environmentObjects.forEach((object) => {
      if (!(object instanceof MushroomObject)) return;
      if (object.isCollectible) return;

      object.x += object.speedX ?? 0;
    });
  }

  collectChestRewards() {
    let collectedRewards = this.lvl.environmentObjects.filter((object) =>
      object instanceof MushroomObject && object.isCollectible && isCollidingWithCharacter(this.character, object)
    );

    if (collectedRewards.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter((object) =>
      !(object instanceof MushroomObject && object.isCollectible && isCollidingWithCharacter(this.character, object))
    );

    let totalSegmentBonus = collectedRewards.reduce(
      (sum, reward) => sum + (reward.maxSegmentBonus ?? 0),
      0
    );

    this.lifeBar.maxSegments += totalSegmentBonus;
    this.lifeBar.triggerSegmentBlink();
    this.lifeBar.setPercentage(this.character.energy);
  }

  checkBossMusicTrigger() {
    if (this.bossMusicTriggered) return;

    const triggerObject = this.lvl.environmentObjects.find((object) => object.startsBossMusic);

    if (!triggerObject) return;

    const characterFrontEdge = this.character.x + this.character.width;
    const triggerX = triggerObject.x + triggerObject.width;

    if (characterFrontEdge < triggerX) return;

    this.bossMusicTriggered = true;
    stopBackgroundAudio(this.backgroundMusicAudio);
    playBackgroundAudio(this.bossMusicAudio);
  }

  checkAliaIntroTrigger() {
    if (!this.alia || this.aliaIntroTriggered || this.aliaIntroCompleted) return;
    if (!this.alia.isIdleForIntro()) return;

    this.startAliaIntro();
  }

  startEndingEscort() {
    if (!this.alia || this.endingEscortActive) return;

    this.endingEscortActive = true;
    this.endingEscortCameraX = this.camera_x;
    this.resetKeyboard();
  }

  updateEndingEscort() {
    if (!this.endingEscortActive || !this.alia) return;

    this.camera_x = this.endingEscortCameraX;
    this.character.imgDirectionChange = false;

    let characterScreenX = this.character.x + this.camera_x;
    let aliaScreenX = this.alia.x + this.camera_x;

    if (characterScreenX <= this.canvas.width + 80 || aliaScreenX <= this.canvas.width + 80) return;

    this.endingEscortActive = false;
    this.isPaused = true;
    this.victoryOverlayVisible = true;
    this.victoryOverlayStartedAt = Date.now();
    this.resetKeyboard();
  }

  playGameOverAudio() {
    if (this.gameOverAudioPlayed) return;

    this.gameOverAudioPlayed = true;
    stopBackgroundAudio(this.backgroundMusicAudio);
    stopBackgroundAudio(this.bossMusicAudio);
    playSoundEffect(this.gameOverAudio);
  }

  isGameOverRetryReady() {
    return this.gameOverStartedAt > 0 && Date.now() - this.gameOverStartedAt >= this.gameOverRetryDelay;
  }

  isVictoryPromptReady() {
    return this.victoryOverlayStartedAt > 0 && Date.now() - this.victoryOverlayStartedAt >= this.victoryPromptDelay;
  }

  onBossIntroFinished() {
    this.removeObjectsBeforeBossArena();

    if (this.bossIntroLaughPlayed) return;

    this.bossIntroLaughPlayed = true;
    playSoundEffect(this.evilLaughAudio);
  }

  removeObjectsBeforeBossArena() {
    let bossArenaStartX = this.lvl.worldSettings?.bossArenaStartX;

    if (typeof bossArenaStartX !== 'number') return;

    this.lvl.platformObjects = this.filterObjectsBeforeX(this.lvl.platformObjects, bossArenaStartX);
    this.lvl.solidObjects = this.filterObjectsBeforeX(this.lvl.solidObjects, bossArenaStartX);
    this.lvl.environmentObjects = this.filterObjectsBeforeX(this.lvl.environmentObjects, bossArenaStartX);
    this.lvl.enemies = this.filterObjectsBeforeX(this.lvl.enemies, bossArenaStartX, enemy => enemy.isBoss);
    this.refreshStandableObjectsCache();
  }

  filterObjectsBeforeX(objects, minX, keepObject = () => false) {
    return (objects ?? []).filter((object) => {
      if (keepObject(object)) return true;
      if (typeof object?.x !== 'number') return true;

      return object.x >= minX;
    });
  }

  updateBossAttackState() {
    if (!this.bossLVL1) return;

    this.bossLVL1.setSlashingState(this.isCharacterWithinBossSlashRange());
  }

  handleBossSlashHit() {
    if (!this.bossLVL1 || this.bossLVL1.isDead) return;
    if (!this.isCharacterWithinBossSlashRange()) return;

    if (this.character.isDead) {
      this.spawnBloodSplatter();
      return;
    }

    if (this.character.isHurt()) return;

    startKnockback(this.character, this.bossLVL1.x + this.bossLVL1.width / 2);
    this.character.hit();
    this.spawnBloodSplatter();
  }

  collectCoins() {
    let collectedCoins = this.lvl.environmentObjects.filter(object =>
      object instanceof Coins && isCollidingWithCharacter(this.character, object)
    );

    if (collectedCoins.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof Coins && isCollidingWithCharacter(this.character, object))
    );

    collectedCoins.forEach((coin) => this.queueFlyingCoinPickup(coin));
    playSoundEffect(this.coinPickupAudio);
  }

  collectBones() {
    let collectedBones = this.lvl.environmentObjects.filter(object =>
      object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object)
    );

    if (collectedBones.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object))
    );

    collectedBones.forEach((bone) => this.queueFlyingBonePickup(bone));
    playSoundEffect(this.bonePickupAudio);
  }

  handleThrowInput() {
    if (this.keyboard.F && !this.throwInputLocked && this.throwableObjects.bones > 0) {
      startThrowingAnimation(this.character);
      playSoundEffect(this.throwingAudio);
      this.throwBone();
      this.throwInputLocked = true;
    }

    if (!this.keyboard.F) {
      this.throwInputLocked = false;
    }
  }

  throwBone() {
    let direction = this.character.imgDirectionChange ? -1 : 1;
    let boneX = direction > 0 ? this.character.x + this.character.width - 60 : this.character.x + 30
    let boneY = this.character.y + 80;
    let bone = new ThrowableObject(boneX, boneY);

    this.assignWorld(bone);
    bone.launch(direction);
    this.thrownBones.push(bone);
    this.throwableObjects.removeBone(1);
  }

  updateThrownBones() {
    this.handleThrownBoneHits();
    this.thrownBones = this.thrownBones.filter(bone => !bone.hasHitTarget && !bone.isOffscreen(this.camera_x, this.canvas.width));
  }

  updateBossThrownSwords() {
    this.handleBossSwordHits();
    this.bossThrownSwords = this.bossThrownSwords.filter((sword) => !sword.hasReturned());
  }

  handleThrownBoneHits() {
    this.thrownBones.forEach(bone => {
      let hitEnemy = this.lvl.enemies.find(enemy =>
        !enemy.isDying &&
        !enemy.isDead &&
        bone.isColliding(enemy)
      );

      if (!hitEnemy) return;

      bone.hasHitTarget = true;

      if (hitEnemy.isBoss) {
        if (hitEnemy.hit()) this.handleEnemyDefeat(hitEnemy);
        return;
      }

      this.handleEnemyDefeat(hitEnemy);
    });
  }

  handleBossSwordHits() {
    this.bossThrownSwords.forEach((sword) => {
      if (sword.hasHitCharacter) return;
      if (this.character.isDead || this.character.isHurt()) return;
      if (!sword.isColliding(this.character)) return;

      sword.hasHitCharacter = true;
      startKnockback(this.character, sword.x + sword.width / 2);
      this.character.hit();
    });
  }

  // Check if the character is stomping on the enemy
  isStompingEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();
    let characterFeet = characterArea.y + characterArea.height;

    return this.character.vcY < 0 && characterFeet <= enemyArea.y + 25;
  }

  bounceOffEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();

    this.character.y = enemyArea.y - characterArea.height - characterArea.offsetY;
    this.character.vcY = 5;
  }

  handleEnemyDefeat(enemy) {
    this.playEnemyDefeatSound(enemy);
    let dyingDuration = enemy.die();

    setTimeout(() => {
      if (!enemy.isBoss) this.spawnThrowableObjectAt(enemy);
      this.removeEnemy(enemy);
    }, dyingDuration);
  }

  playEnemyDefeatSound(enemy) {
    if (!(enemy instanceof SkeletonWarriorLVL1)) return;

    this.lastBoneBreakAudioIndex = playRandomVariantSound(this.boneBreakAudios, this.lastBoneBreakAudioIndex);
  }

  spawnThrowableObjectAt(enemy) {
    let enemyArea = enemy.getCollisionArea();
    let bone = new ThrowableObject();

    bone.x = enemyArea.x + enemyArea.width / 2 - bone.width / 2;
    bone.y = enemyArea.y + enemyArea.height / 2 - bone.height / 2;
    bone.baseY = bone.y;
    this.assignWorld(bone);
    this.lvl.environmentObjects.push(bone);
  }

  removeEnemy(enemyToRemove) {
    if (enemyToRemove.isBoss && !this.alia) {
      this.spawnAliaAtBoss(enemyToRemove);
    }

    this.lvl.enemies = this.lvl.enemies.filter(enemy => enemy !== enemyToRemove);
  }

  spawnAliaAtBoss(boss) {
    let aliaX = boss.x + boss.width / 2 - 130;
    let aliaY = boss.y + boss.height - 260;

    this.alia = new Alia(aliaX, aliaY);
    this.assignWorld(this.alia);
  }

  startAliaIntro() {
    if (!this.alia || this.aliaIntroTriggered || this.aliaIntroCompleted) return;

    this.aliaIntroTriggered = true;
    this.aliaIntroCompleted = true;
    this.isPaused = true;
    this.aliaIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.aliaIntroTimeout = setTimeout(() => {
      this.finishAliaIntro();
    }, this.aliaIntroDuration);
  }
}