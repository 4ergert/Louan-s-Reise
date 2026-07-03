import { playBackgroundAudio, playSoundEffect, stopBackgroundAudio } from '../../js/audio.js';
import { isCollidingWithCharacter } from '../../js/colliding-objects.js';
import { startKnockback, startThrowingAnimation } from '../character/char-animation-actions.js';
import { Coins } from '../objects/coin-object.class.js';
import { MushroomObject } from '../objects/mushroom-object.class.js';
import { ThrowableObject } from '../objects/throwable-objects.class.js';

export const worldInteractionMethods = {
  updateWorldInteractions() {
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
  },

  unlockTouchedObjects() {
    (this.lvl.solidObjects ?? []).forEach((solidObject) => {
      if (!solidObject.unlockImagePath || solidObject.isUnlocked) return;
      if (!this.character.isColliding(solidObject)) return;
      if (this.shouldIgnoreSolidCollisionFromBelow(solidObject)) return;

      if (solidObject.unlock()) this.spawnUnlockReward(solidObject);
    });
  },

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
  },

  updateChestRewards() {
    this.lvl.environmentObjects.forEach((object) => {
      if (!(object instanceof MushroomObject)) return;
      if (object.isCollectible) return;

      object.x += object.speedX ?? 0;
    });
  },

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
    playSoundEffect(this.mushroomPickupAudio);
  },

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
  },

  checkAliaIntroTrigger() {
    if (!this.alia || this.aliaIntroTriggered || this.aliaIntroCompleted) return;
    if (!this.alia.isIdleForIntro()) return;

    this.startAliaIntro();
  },

  collectCoins() {
    let collectedCoins = this.lvl.environmentObjects.filter((object) =>
      object instanceof Coins && isCollidingWithCharacter(this.character, object)
    );

    if (collectedCoins.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter((object) =>
      !(object instanceof Coins && isCollidingWithCharacter(this.character, object))
    );

    collectedCoins.forEach((coin) => this.queueFlyingCoinPickup(coin));
    playSoundEffect(this.coinPickupAudio);
  },

  collectBones() {
    let collectedBones = this.lvl.environmentObjects.filter((object) =>
      object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object)
    );

    if (collectedBones.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter((object) =>
      !(object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object))
    );

    collectedBones.forEach((bone) => this.queueFlyingBonePickup(bone));
    playSoundEffect(this.bonePickupAudio);
  },

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
  },

  throwBone() {
    let direction = this.character.imgDirectionChange ? -1 : 1;
    let boneX = direction > 0 ? this.character.x + this.character.width - 60 : this.character.x + 30;
    let boneY = this.character.y + 80;
    let bone = new ThrowableObject(boneX, boneY);

    this.assignWorld(bone);
    bone.launch(direction);
    this.thrownBones.push(bone);
    this.throwableObjects.removeBone(1);
  },

  updateThrownBones() {
    this.handleThrownBoneHits();
    this.thrownBones = this.thrownBones.filter((bone) => !bone.hasHitTarget && !bone.isOffscreen(this.camera_x, this.canvas.width));
  },

  updateBossThrownSwords() {
    this.handleBossSwordHits();
    this.bossThrownSwords = this.bossThrownSwords.filter((sword) => !sword.hasReturned());
  },

  handleThrownBoneHits() {
    this.thrownBones.forEach((bone) => {
      let hitEnemy = this.lvl.enemies.find((enemy) =>
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
  },

  handleBossSwordHits() {
    this.bossThrownSwords.forEach((sword) => {
      if (sword.hasHitCharacter) return;
      if (this.character.isDead || this.character.isHurt()) return;
      if (!sword.isColliding(this.character)) return;

      sword.hasHitCharacter = true;
      startKnockback(this.character, sword.x + sword.width / 2);
      this.character.hit();
    });
  },

  spawnThrowableObjectAt(enemy) {
    let enemyArea = enemy.getCollisionArea();
    let bone = new ThrowableObject();

    bone.x = enemyArea.x + enemyArea.width / 2 - bone.width / 2;
    bone.y = enemyArea.y + enemyArea.height / 2 - bone.height / 2;
    bone.baseY = bone.y;
    this.assignWorld(bone);
    this.lvl.environmentObjects.push(bone);
  },
};
