import { createBloodSplatterParticles } from '../js/world-effects.js';
import { drawBloodSplatter, drawBossLifeBar, drawGameOverOverlay } from '../js/world-renderer.js';
import { createBoneBreakAudios, createBossMusicAudio, createCoinPickupAudio, createEvilLaughAudio, createGameOverAudio, createRookPickupAudio, createThrowingAudio, playBackgroundAudio, playRandomVariantSound, playSoundEffect, stopBackgroundAudio } from '../js/audio.js';
import { Character } from './character/character.class.js';
import { Alia } from './Alia/alia.class.js';
import { LifeBar } from './character/life-bar.class.js';
import { CoinsBar } from './lvl-1/coins-bar.class.js';
import { Coins } from './lvl-1/coins.class.js';
import { ThrowableObject } from './objects/throwable-objects.class.js';
import { BossSwordObject } from './objects/boss-sword-object.class.js';
import { EnvironmentObject } from './objects/environment-objects.class.js';
import { MushroomObject } from './objects/mushroom-object.class.js';
import { WorldIntros } from './world-intros.class.js';
import { SkeletonWarriorLVL1 } from './enemies/skeleton_warrior_1.class.js';
import { lvl_1 } from '../lvl/lvl_1.js';
import { isCollidingWithCharacter, isColliding, isCharacterWithinBossSlashRange } from '../js/colliding-objects.js';
import { isSpawning } from './character/char-movements.js';
import { startKnockback, startThrowingAnimation } from './character/char-animation-actions.js';

export class World extends WorldIntros {
  character = new Character();
  alia = null;
  lifeBar = new LifeBar();
  coinsBar = new CoinsBar();
  throwableObjects = new ThrowableObject(16, 111, true);
  thrownRooks = [];
  bossThrownSwords = [];
  lvl = lvl_1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  throwInputLocked = false;
  bloodSplatterParticles = [];
  isPaused = false;
  coinPickupAudio = createCoinPickupAudio();
  rookPickupAudio = createRookPickupAudio();
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

  constructor(canvas, keyboard, backgroundMusicAudio = null) {
    super();
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.backgroundMusicAudio = backgroundMusicAudio;
    this.applyLevelWorldSettings();
    this.draw();
    this.setWorld();
    this.checkCollisions();
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

  draw() {
    this.updateOpeningIntro();
    this.updateBossIntro();
    this.handleIntroSkip();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgrounds();

    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.addObjectsToMap(this.thrownRooks);
    this.addObjectsToMap(this.bossThrownSwords);

    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.lifeBar);
    if (this.shouldShowBossLifeBar()) drawBossLifeBar(this.ctx, this.camera_x, this.bossLVL1, this.canvas);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.ctx.translate(this.camera_x, 0);
    this.addToMap(this.character);
    if (this.alia) this.addToMap(this.alia);

    this.ctx.translate(-this.camera_x, 0);

    if (this.character.isDead) {
      this.playGameOverAudio();
      drawGameOverOverlay(this.ctx, this.canvas);
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

    // this.drawBloodSplatter();



    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
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
    const spawnX = this.bossLVL1.x + (spawnDirection < 0 ? 110 : 190);
    const spawnY = this.bossLVL1.y + 180;

    this.assignWorld(skeletonWarrior);
    skeletonWarrior.launchFromBoss(spawnDirection, spawnX, spawnY);
    this.lvl.enemies.push(skeletonWarrior);
  }

  spawnBossSwordBoomerang() {
    if (!this.bossLVL1 || this.bossLVL1.isiDying || this.bossLVL1.isDead) return;

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
      this.addToMap(object);
    });
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

  checkCollisions() {
    setInterval(() => {
      if (this.isPaused) return;

      this.getStandableObjects().forEach(platform => {
        if (this.character.isLandingOn(platform)) {
          this.character.landOn(platform);
        }

        if (this.alia?.isLandingOn(platform)) {
          this.alia.landOn(platform);
          this.alia.hasLanded = true;
        }

        this.lvl.enemies.forEach(enemy => {
          if (enemy.isBoss || enemy.isDying || enemy.isDead) return;
          if (typeof enemy.isLandingOn !== "function" || typeof enemy.landOn !== "function") return;

          if (enemy.isLandingOn(platform)) {
            enemy.landOn(platform);
          }
        });

        this.lvl.environmentObjects.forEach((object) => {
          if (!object.affectedByPlatforms) return;
          if (!object.isLandingOn(platform)) return;

          object.landOn(platform);
          object.speedX = 0;
          object.isCollectible = true;
        });
      });

      this.updateChestRewards();
      this.unlockTouchedObjects();
      this.blockCharacterBySolidObjects();

      this.collectCoins();
      this.collectChestRewards();
      this.collectRooks();
      this.checkBossMusicTrigger();
      this.checkAliaIntroTrigger();

      if (this.character.isDying || this.character.isDead) {
        return;
      }

      this.handleThrowInput();
      this.updateThrownRooks();
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
    }, 1000 / 60);
  }

  getStandableObjects() {
    return [
      ...(this.lvl.platformObjects ?? []),
      ...(this.lvl.solidObjects ?? []),
    ];
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

    this.character.energy = Math.min(100, this.character.energy + collectedRewards.length * 20);
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
    if (!this.alia || this.aliaIntroTriggered) return;
    if (!this.alia.isIdleForIntro()) return;

    this.startAliaIntro();
  }

  playGameOverAudio() {
    if (this.gameOverAudioPlayed) return;

    this.gameOverAudioPlayed = true;
    stopBackgroundAudio(this.backgroundMusicAudio);
    stopBackgroundAudio(this.bossMusicAudio);
    playSoundEffect(this.gameOverAudio);
  }

  onBossIntroFinished() {
    if (this.bossIntroLaughPlayed) return;

    this.bossIntroLaughPlayed = true;
    playSoundEffect(this.evilLaughAudio);
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

    this.coinsBar.addCoin(collectedCoins.length);
    playSoundEffect(this.coinPickupAudio);
  }

  collectRooks() {
    let collectedRooks = this.lvl.environmentObjects.filter(object =>
      object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object)
    );

    if (collectedRooks.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object))
    );

    this.throwableObjects.addRook(collectedRooks.length);
    playSoundEffect(this.rookPickupAudio);
  }

  handleThrowInput() {
    if (this.keyboard.F && !this.throwInputLocked && this.throwableObjects.rooks > 0) {
      startThrowingAnimation(this.character);
      playSoundEffect(this.throwingAudio);
      this.throwRook();
      this.throwInputLocked = true;
    }

    if (!this.keyboard.F) {
      this.throwInputLocked = false;
    }
  }

  throwRook() {
    let direction = this.character.imgDirectionChange ? -1 : 1;
    let rookX = direction > 0 ? this.character.x + this.character.width - 60 : this.character.x + 30
    let rookY = this.character.y + 80;
    let rook = new ThrowableObject(rookX, rookY);

    this.assignWorld(rook);
    rook.launch(direction);
    this.thrownRooks.push(rook);
    this.throwableObjects.removeRook(1);
  }

  updateThrownRooks() {
    this.thrownRooks.forEach(rook => rook.updateThrow());
    this.handleThrownRookHits();
    this.thrownRooks = this.thrownRooks.filter(rook => !rook.hasHitTarget && !rook.isOffscreen(this.camera_x, this.canvas.width));
  }

  updateBossThrownSwords() {
    this.bossThrownSwords.forEach((sword) => sword.updateFlight());
    this.handleBossSwordHits();
    this.bossThrownSwords = this.bossThrownSwords.filter((sword) => !sword.hasReturned());
  }

  handleThrownRookHits() {
    this.thrownRooks.forEach(rook => {
      let hitEnemy = this.lvl.enemies.find(enemy =>
        !enemy.isDying &&
        !enemy.isDead &&
        rook.isColliding(enemy)
      );

      if (!hitEnemy) return;

      rook.hasHitTarget = true;

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
    let rook = new ThrowableObject();

    rook.x = enemyArea.x + enemyArea.width / 2 - rook.width / 2;
    rook.y = enemyArea.y + enemyArea.height / 2 - rook.height / 2;
    rook.baseY = rook.y;
    this.assignWorld(rook);
    this.lvl.environmentObjects.push(rook);
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
    if (!this.alia || this.aliaIntroTriggered) return;

    this.aliaIntroTriggered = true;
    this.isPaused = true;
    this.aliaIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.aliaIntroTimeout = setTimeout(() => {
      this.finishAliaIntro();
    }, this.aliaIntroDuration);
  }
}