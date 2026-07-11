import { LVL_1_BOSS_SPRITES } from '../../sprites-path/lvl-1-boss-sprites.js';
import { lvl1BossCombatMethods } from './lvl-1-boss-combat.js';
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
   * Advances the boss animation timer.
   *
   * @returns {void}
   */
  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.dyingAnimationSpeed)) return;

    this.playAnimation(this.animationFrames);
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

Object.assign(LVL_1_Boss.prototype, lvl1BossCombatMethods);