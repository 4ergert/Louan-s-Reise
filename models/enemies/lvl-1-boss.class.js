import { playSoundEffect } from '../../js/audio.js';
import { LVL_1_BOSS_SPRITES } from '../../js/sprites-path/lvl-1-boss-sprites.js';
import { MovableObject } from '../objects/movable-object.class.js';

/**
 * Creates the default mutable state for the level 1 boss.
 *
 * @returns {Record<string, boolean | number | null | Array<*>>}
 */
function createDefaultBossState() {
  return {
    height: 500,
    width: 500,
    y: -10,
    x: 4200,
    speed: 0.4,
    imgDirectionChange: true,
    isBoss: true,
    maxEnergy: 5,
    energy: 5,
    isHurt: false,
    isDying: false,
    isDead: false,
    isSlashing: false,
    isSlashAnimationActive: false,
    isThrowingAnimationActive: false,
    slashHitTriggered: false,
    skeletonThrowTriggered: false,
    thrownSkeletonCount: 0,
    dyingAnimationSpeed: 100,
    animationFrames: [],
    hurtTimeout: null,
    animationElapsed: 0,
    skeletonThrowElapsed: 0,
  };
}

/**
 * Creates the boss animation set from the sprite definitions.
 *
 * @returns {{
 *   IDLE: string[],
 *   WALKING: string[],
 *   HURT: string[],
 *   DYING: string[],
 *   SLASHING: string[],
 *   THROWING: string[]
 * }}
 */
function createBossAnimations() {
  return {
    IDLE: LVL_1_BOSS_SPRITES.IDLE_ANIMATION,
    WALKING: LVL_1_BOSS_SPRITES.WALKING_ANIMATION,
    HURT: LVL_1_BOSS_SPRITES.HURT_ANIMATION,
    DYING: LVL_1_BOSS_SPRITES.DYING_ANIMATION,
    SLASHING: LVL_1_BOSS_SPRITES.SLASHING_ANIMATION,
    THROWING: LVL_1_BOSS_SPRITES.THROWING_ANIMATION,
  };
}

/**
 * Level 1 boss enemy with movement, attack, hurt, and death state handling.
 */
export class LVL_1_Boss extends MovableObject {
  /**
   * Creates the boss instance and preloads its animations.
   */
  constructor() {
    super();
    Object.assign(this, createDefaultBossState());
    Object.assign(this, createBossAnimations());
    this.loadImage(this.IDLE[0]);
    this.loadImages(this.IDLE);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);
    this.loadImages(this.SLASHING);
    this.loadImages(this.THROWING);
    this.loadImages(this.WALKING);
    this.animationFrames = this.IDLE;
  }

  /**
   * Returns the boss animation that should be used while no one-shot state is active.
   *
   * @returns {string[]}
   */
  getDefaultAnimation() {
    return this.canWalkLeft() ? this.WALKING : this.IDLE;
  }

  /**
   * Runs the boss update pipeline for the current world step.
   *
   * @returns {void}
   */
  updateStep() {
    if (this.isWorldPaused()) return;

    this.updateMovementStep();
    this.updateAnimationStep();
    this.updateSkeletonThrowStep();
  }

  /**
   * Moves the boss left while walking is allowed.
   *
   * @returns {void}
   */
  updateMovementStep() {
    if (!this.canWalkLeft()) return;

    this.x -= this.speed;
  }

  /**
   * Checks whether the boss is currently allowed to walk left.
   *
   * @returns {boolean}
   */
  canWalkLeft() {
    if (!this.world || this.isWorldPaused()) return false;
    if (this.world.character?.isDying || this.world.character?.isDead) return false;
    if (!this.world.bossIntroTriggered || this.world.isBossIntroActive?.()) return false;
    if (this.isDead || this.isDying || this.isHurt) return false;
    if (this.thrownSkeletonCount < 1) return false;
    return !this.isThrowingAnimationActive;
  }

  /**
   * Advances the timer for periodic throw attacks.
   *
   * @returns {void}
   */
  updateSkeletonThrowStep() {
    this.skeletonThrowElapsed += this.world?.updateStepMs ?? 0;

    if (this.skeletonThrowElapsed < 5000) return;

    this.skeletonThrowElapsed -= 5000;
    if (this.canStartSkeletonThrow()) this.startSkeletonThrowAnimation();
  }

  /**
   * Checks whether a throw animation may start.
   *
   * @returns {boolean}
   */
  canStartSkeletonThrow() {
    if (!this.world || this.isWorldPaused()) return false;
    if (this.world.character?.isDying || this.world.character?.isDead) return false;
    if (this.isDying || this.isDead || this.isHurt) return false;
    if (this.isSlashing || this.isSlashAnimationActive || this.isThrowingAnimationActive) return false;
    if (this.world.isBossIntroActive?.()) return false;
    return this.world.bossIntroTriggered;
  }

  /**
   * Starts the skeleton throw animation.
   *
   * @returns {void}
   */
  startSkeletonThrowAnimation() {
    if (this.world?.character?.isDying || this.world?.character?.isDead) return;

    this.isThrowingAnimationActive = true;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.THROWING;
    this.currentImage = 0;
  }

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
    let i = this.showAnimationFrame(images, !isSingleRunAnimation);

    this.triggerSlashHitIfReady(i, isSlashAnimation);

    if (this.triggerSkeletonThrowIfReady(i, isThrowingAnimation)) return;

    if (this.finishSingleRunAnimationIfNeeded(images, isSingleRunAnimation, isSlashAnimation, isThrowingAnimation)) return;
  }

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
  }

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
  }

  /**
   * Checks whether the current throw animation should be aborted.
   *
   * @returns {boolean}
   */
  shouldCancelThrowingAnimation() {
    return this.world?.character?.isDying || this.world?.character?.isDead;
  }

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
  }

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
  }

  /**
   * Advances the boss animation timer.
   *
   * @returns {void}
   */
  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.dyingAnimationSpeed)) return;

    this.playAnimation(this.animationFrames);
  }

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
  }

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
  }

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
  }

  /**
   * Updates whether the boss should remain in slash state.
   *
   * @param {boolean} isSlashing
   * @returns {void}
   */
  setSlashingState(isSlashing) {
    if (this.isDying || this.isDead || this.isHurt) return;
    if (isSlashing) {
      this.startSlashAnimation();
      return;
    }

    if (this.isSlashAnimationActive) return;
    if (!this.isSlashing) return;

    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.getDefaultAnimation();
    this.currentImage = 0;
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  /**
   * Clears the active hurt timeout.
   *
   * @returns {void}
   */
  clearHurtTimeout() {
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;
  }

  /**
   * Calculates the total duration of the dying animation.
   *
   * @returns {number}
   */
  getDyingDuration() {
    return this.DYING.length * this.dyingAnimationSpeed + 50;
  }

  /**
   * Returns the collision box used for combat and contact checks.
   *
   * @returns {{ x: number, y: number, width: number, height: number, offsetY: number }}
   */
  getCollisionArea() {
    return {
      x: this.x + 180,
      y: this.y + 230,
      width: this.width - 350,
      height: this.height - 400,
      offsetY: 30,
    };
  }
}