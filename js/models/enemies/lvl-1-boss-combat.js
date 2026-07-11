import { playSoundEffect } from '../../audio.js';

/**
 * Combat, damage, and one-shot animation methods for the level 1 boss.
 */
export const lvl1BossCombatMethods = {
  /**
   * Advances the current animation and runs frame-based attack side effects.
   *
   * @param {string[]} images
   * @returns {void}
   */
  playAnimation(images) {
    let isSlashAnimation = images === this.SLASHING && this.isSlashAnimationActive;
    let isThrowingAnimation = images === this.THROWING && this.isThrowingAnimationActive;
    let isSingleRunAnimation = this.isDying || this.isHurt || isSlashAnimation || isThrowingAnimation;
    let frameIndex = this.showAnimationFrame(images, !isSingleRunAnimation);

    this.triggerSlashHitIfReady(frameIndex, isSlashAnimation);

    if (this.triggerSkeletonThrowIfReady(frameIndex, isThrowingAnimation)) return;

    this.finishSingleRunAnimationIfNeeded(images, isSingleRunAnimation, isSlashAnimation, isThrowingAnimation);
  },

  /**
   * Triggers the slash hit once the slash animation reaches its hit frame.
   *
   * @param {number} frameIndex
   * @param {boolean} isSlashAnimation
   * @returns {void}
   */
  triggerSlashHitIfReady(frameIndex, isSlashAnimation) {
    if (!isSlashAnimation || this.slashHitTriggered || frameIndex < 4) return;

    this.slashHitTriggered = true;
    this.world?.handleBossSlashHit?.();
  },

  /**
   * Triggers the throw side effect once the throwing animation reaches its release frame.
   *
   * @param {number} frameIndex
   * @param {boolean} isThrowingAnimation
   * @returns {boolean}
   */
  triggerSkeletonThrowIfReady(frameIndex, isThrowingAnimation) {
    if (!isThrowingAnimation || this.skeletonThrowTriggered || frameIndex < 4) return false;

    if (this.shouldCancelThrowingAnimation()) {
      this.finishThrowingAnimation();
      return true;
    }

    this.skeletonThrowTriggered = true;
    this.thrownSkeletonCount++;
    this.spawnThrowAttack();
    return false;
  },

  /**
   * Checks whether the current throw animation should be aborted.
   *
   * @returns {boolean}
   */
  shouldCancelThrowingAnimation() {
    return this.world?.character?.isDying || this.world?.character?.isDead;
  },

  /**
   * Spawns either a skeleton add or the boss sword boomerang.
   *
   * @returns {void}
   */
  spawnThrowAttack() {
    if (this.thrownSkeletonCount % 3 === 0) {
      this.world?.spawnBossSwordBoomerang?.();
      return;
    }

    this.world?.spawnSkeletonWarriorFromBoss?.();
  },

  /**
   * Finishes one-shot animations when their final frame has been reached.
   *
   * @param {string[]} images
   * @param {boolean} isSingleRunAnimation
   * @param {boolean} isSlashAnimation
   * @param {boolean} isThrowingAnimation
   * @returns {boolean}
   */
  finishSingleRunAnimationIfNeeded(images, isSingleRunAnimation, isSlashAnimation, isThrowingAnimation) {
    if (!isSingleRunAnimation || this.currentImage < images.length - 1) return false;

    if (this.isHurt) this.finishHurtAnimation();
    if (isSlashAnimation) this.finishSlashAnimation();
    if (isThrowingAnimation) this.finishThrowingAnimation();
    return true;
  },

  /**
   * Applies damage to the boss and starts hurt or death handling.
   *
   * @returns {boolean}
   */
  hit() {
    if (this.isDying || this.isDead) return false;

    this.energy = Math.max(0, this.energy - 1);
    this.startHurtAnimation();
    if (this.energy > 0) return false;

    this.die();
    return true;
  },

  /**
   * Starts the hurt animation and clears attack-related state.
   *
   * @returns {void}
   */
  startHurtAnimation() {
    this.isHurt = true;
    this.isSlashing = false;
    this.isSlashAnimationActive = false;
    this.isThrowingAnimationActive = false;
    this.slashHitTriggered = false;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.HURT;
    this.currentImage = 0;

    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = setTimeout(() => this.finishHurtAnimation(), this.HURT.length * this.dyingAnimationSpeed + 50);
  },

  /**
   * Finishes the hurt animation and restores the next appropriate animation.
   *
   * @returns {void}
   */
  finishHurtAnimation() {
    if (this.isDying || !this.isHurt) return;

    this.isHurt = false;
    let shouldKeepSlashing = this.isSlashing || this.world?.isCharacterWithinBossSlashRange?.();
    this.isSlashing = shouldKeepSlashing;
    this.isSlashAnimationActive = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.getDefaultAnimation();
    this.currentImage = 0;
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;
  },

  /**
   * Updates whether the boss should remain in slash state.
   *
   * @param {boolean} isSlashing
   * @returns {void}
   */
  setSlashingState(isSlashing) {
    if (this.isDying || this.isDead || this.isHurt) return;
    if (isSlashing) return this.startSlashAnimation();
    if (this.isSlashAnimationActive) return;
    if (!this.isSlashing) return;

    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.getDefaultAnimation();
    this.currentImage = 0;
  },

  /**
   * Starts the slash animation and plays its sound effect.
   *
   * @returns {void}
   */
  startSlashAnimation() {
    if (this.isSlashAnimationActive) return;

    this.isSlashing = true;
    this.isSlashAnimationActive = true;
    this.slashHitTriggered = false;
    this.animationFrames = this.SLASHING;
    this.currentImage = 0;
    playSoundEffect(this.world?.bossSlashingSwordAudio);
  },

  /**
   * Finishes the slash animation and decides whether the boss keeps slashing.
   *
   * @returns {void}
   */
  finishSlashAnimation() {
    if (!this.isSlashAnimationActive || this.isDying || this.isDead) return;

    let shouldKeepSlashing = this.world?.isCharacterWithinBossSlashRange?.() || false;
    this.isSlashAnimationActive = shouldKeepSlashing;
    this.isSlashing = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.getDefaultAnimation();
    this.currentImage = 0;
  },

  /**
   * Finishes the throw animation and returns to the default loop.
   *
   * @returns {void}
   */
  finishThrowingAnimation() {
    if (!this.isThrowingAnimationActive || this.isDying || this.isDead) return;

    this.isThrowingAnimationActive = false;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.getDefaultAnimation();
    this.currentImage = 0;
  },

  /**
   * Resets the boss into its neutral idle state.
   *
   * @returns {void}
   */
  setIdleState() {
    if (this.isDying || this.isDead) return;

    this.isHurt = false;
    this.isSlashing = false;
    this.isSlashAnimationActive = false;
    this.isThrowingAnimationActive = false;
    this.slashHitTriggered = false;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.IDLE;
    this.currentImage = 0;
    this.imgDirectionChange = true;
  },

  /**
   * Starts the death animation and schedules the final dead flag.
   *
   * @returns {number}
   */
  die() {
    const dyingDuration = this.getDyingDuration();
    if (this.isDying || this.isDead) return dyingDuration;

    this.prepareDeathState();
    setTimeout(() => this.isDead = true, dyingDuration);

    return dyingDuration;
  },

  /**
   * Prepares the boss state for the death animation.
   *
   * @returns {void}
   */
  prepareDeathState() {
    this.isDying = true;
    this.isHurt = false;
    this.isSlashing = false;
    this.isSlashAnimationActive = false;
    this.isThrowingAnimationActive = false;
    this.slashHitTriggered = false;
    this.skeletonThrowTriggered = false;
    this.thrownSkeletonCount = 0;
    this.animationFrames = this.DYING;
    this.currentImage = 0;
    this.clearHurtTimeout();
  },

  /**
   * Clears the active hurt timeout.
   *
   * @returns {void}
   */
  clearHurtTimeout() {
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;
  },

  /**
   * Calculates the total duration of the dying animation.
   *
   * @returns {number}
   */
  getDyingDuration() {
    return this.DYING.length * this.dyingAnimationSpeed + 50;
  },
};
