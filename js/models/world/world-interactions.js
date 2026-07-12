import { playBackgroundAudio, playSoundEffect, stopBackgroundAudio } from '../../audio.js';
import { isCollidingWithCharacter } from '../../colliding-objects.js';
import { startKnockback, startThrowingAnimation } from '../character/char-animation-actions.js';
import { Coins } from '../objects/coin-object.class.js';
import { MushroomObject } from '../objects/mushroom-object.class.js';
import { ThrowableObject } from '../objects/throwable-objects.class.js';

/**
 * World interaction methods for pickups, rewards, throws, and encounter triggers.
 */
export const worldInteractionMethods = {
  /**
   * Runs the interaction pipeline for the current fixed update.
   *
   * @returns {void}
   */
  updateWorldInteractions() {
    this.updateChestRewards();
    this.unlockTouchedObjects();
    this.blockCharacterBySolidObjects();
    this.collectCoins();
    this.collectChestRewards();
    this.collectBones();
    this.checkRemoveObjectsTrigger();
    this.checkBossMusicTrigger();
    this.checkAliaIntroTrigger();
    this.handleCharacterFallDeath();
    this.handleEnemyFallDeath();
  },

  /**
   * Unlocks touched solid objects and spawns their rewards when applicable.
   *
   * @returns {void}
   */
  unlockTouchedObjects() {
    (this.lvl.solidObjects ?? []).forEach((solidObject) => {
      if (!solidObject.unlockImagePath || solidObject.isUnlocked) return;
      if (!this.character.isColliding(solidObject)) return;
      if (this.shouldIgnoreSolidCollisionFromBelow(solidObject)) return;

      if (solidObject.unlock()) this.spawnUnlockReward(solidObject);
    });
  },

  /**
   * Spawns the reward released by an unlocked solid object.
   *
   * @param {*} solidObject
   * @returns {void}
   */
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

  /**
   * Advances spawned chest rewards until they become collectible.
   *
   * @returns {void}
   */
  updateChestRewards() {
    this.lvl.environmentObjects.forEach((object) => {
      if (!(object instanceof MushroomObject)) return;
      if (object.isCollectible) return;

      object.x += object.speedX ?? 0;
    });
  },

  /**
   * Collects all touched chest rewards and applies their bonuses.
   *
   * @returns {void}
   */
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

  /**
   * Removes all level objects before a configured x-position once the character touches the trigger object.
   *
   * @returns {void}
   */
  checkRemoveObjectsTrigger() {
    const triggerObject = this.lvl.environmentObjects.find((object) =>
      typeof object.removeObjectsBeforeX === 'number' && !object.hasRemovedObjectsBeforeX
    );

    if (!triggerObject) return;
    if (!isCollidingWithCharacter(this.character, triggerObject)) return;

    triggerObject.hasRemovedObjectsBeforeX = true;
    this.removeObjectsBeforeX(triggerObject.removeObjectsBeforeX);
  },

  /**
   * Starts boss music once the character reaches the trigger object.
   *
   * @returns {void}
   */
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

  /**
   * Starts the Alia intro when Alia is present and idle.
   *
   * @returns {void}
   */
  checkAliaIntroTrigger() {
    if (this.liam && this.LiamIntroLines?.length) {
      if (this.aliaIntroTriggered || this.liamIntroCompleted) return;
      if (!this.liam.isIdleForIntro?.()) return;

      this.startAliaIntro();
      return;
    }

    if (this.aliaIntroTriggered || this.aliaIntroCompleted) return;
    if (!this.alia) return;
    if (!this.alia.isIdleForIntro()) return;

    this.startAliaIntro();
  },

  /**
   * Collects coins currently colliding with the character.
   *
   * @returns {void}
   */
  collectCoins() {
    this.collectPickupType(
      (object) => object instanceof Coins,
      (coin) => this.queueFlyingCoinPickup(coin),
      this.coinPickupAudio
    );
  },

  /**
   * Collects throwable bones currently colliding with the character.
   *
   * @returns {void}
   */
  collectBones() {
    if (this.shouldShowOpeningIntroHintOnBonePickup()) {
      this.openingIntroHintStartedAt = Date.now();
      this.openingIntroHintShown = true;
    }

    this.collectPickupType(
      (object) => object instanceof ThrowableObject,
      (bone) => this.queueFlyingBonePickup(bone),
      this.bonePickupAudio
    );
  },

  /**
   * Returns whether the throw hint should be shown for the first collected bone.
   *
   * @returns {boolean}
   */
  shouldShowOpeningIntroHintOnBonePickup() {
    if (!this.openingIntroHintText || this.openingIntroHintShown) return false;

    return this.lvl.environmentObjects.some((object) =>
      object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object)
    );
  },

  /**
   * Collects all pickups of the provided type that currently collide with the character.
   *
   * @param {(object: *) => boolean} isMatchingPickup
   * @param {(pickup: *) => void} onCollect
   * @param {HTMLAudioElement | null | undefined} pickupAudio
   * @returns {void}
   */
  collectPickupType(isMatchingPickup, onCollect, pickupAudio) {
    let collectedPickups = this.lvl.environmentObjects.filter((object) =>
      isMatchingPickup(object) && isCollidingWithCharacter(this.character, object)
    );

    if (collectedPickups.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter((object) =>
      !(isMatchingPickup(object) && isCollidingWithCharacter(this.character, object))
    );

    collectedPickups.forEach((pickup) => onCollect(pickup));
    playSoundEffect(pickupAudio);
  },

  /**
   * Handles bone throw input and locking.
   *
   * @returns {void}
   */
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

  /**
   * Spawns and launches a throwable bone from the character.
   *
   * @returns {void}
   */
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

  /**
   * Updates thrown bones and removes those that hit or left the screen.
   *
   * @returns {void}
   */
  updateThrownBones() {
    this.handleThrownBoneHits();
    this.thrownBones = this.thrownBones.filter((bone) => !bone.hasHitTarget && !bone.isOffscreen(this.camera_x, this.canvas.width));
  },

  /**
   * Updates boss swords and removes those that returned.
   *
   * @returns {void}
   */
  updateBossThrownSwords() {
    this.handleBossSwordHits();
    this.bossThrownSwords = this.bossThrownSwords.filter((sword) => !sword.hasReturned());
  },

  /**
   * Resolves thrown-bone collisions against living enemies.
   *
   * @returns {void}
   */
  handleThrownBoneHits() {
    this.thrownBones.forEach((bone) => {
      const hitEnemy = this.getHitEnemyForBone(bone);
      if (!hitEnemy) return;

      this.handleThrownBoneHit(bone, hitEnemy);
    });
  },

  /**
   * Returns the first enemy hit by the provided bone.
   *
   * @param {ThrowableObject} bone
   * @returns {* | undefined}
   */
  getHitEnemyForBone(bone) {
    return this.lvl.enemies.find((enemy) => this.canBoneHitEnemy(bone, enemy));
  },

  /**
   * @param {ThrowableObject} bone
   * @param {*} enemy
   * @returns {boolean}
   */
  canBoneHitEnemy(bone, enemy) {
    return !enemy.isDying && !enemy.isDead && bone.isColliding(enemy);
  },

  /**
   * Applies the hit result of a thrown bone to the matched enemy.
   *
   * @param {ThrowableObject} bone
   * @param {*} hitEnemy
   * @returns {void}
   */
  handleThrownBoneHit(bone, hitEnemy) {
    bone.hasHitTarget = true;

    if (!hitEnemy.isBoss) {
      this.handleEnemyDefeat(hitEnemy);
      return;
    }

    if (hitEnemy.hit()) this.handleEnemyDefeat(hitEnemy);
  },

  /**
   * Resolves collisions between boss swords and the character.
   *
   * @returns {void}
   */
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

  /**
   * Spawns a throwable bone pickup at the defeated enemy's position.
   *
   * @param {{ getCollisionArea: () => { x: number, y: number, width: number, height: number } }} enemy
   * @returns {void}
   */
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
