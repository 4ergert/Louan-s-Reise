import { MovableObject } from '../objects/movable-object.class.js';
import { ALIA_SPRITES } from './alia-sprites.js';

/**
 * Companion character that follows the player and switches between idle and run animations.
 */
export class Alia extends MovableObject {
  world;
  speed = 3;
  currentAnimation = null;
  maxDistanceToCharacter = 100;
  followTolerance = 8;
  hasLanded = false;
  animationElapsed = 0;
  animationIntervalMs = 100;

  IDLE = ALIA_SPRITES.IDLE_ANIMATION;
  WALK = ALIA_SPRITES.WALK_ANIMATION;
  RUN = ALIA_SPRITES.RUN_ANIMATION;

  /**
   * @param {number} x Initial horizontal position.
   * @param {number} y Initial vertical position.
   */
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.loadImage(ALIA_SPRITES.IDLE_ANIMATION[0]);
    this.loadImages(this.IDLE);
    this.loadImages(this.WALK);
    this.loadImages(this.RUN);

    this.applyGravity();
  }

  /**
   * Advances gravity, following behavior, and animation playback for one update step.
   */
  updateStep() {
    super.updateStep();
    this.followCharacter();
    this.updateAnimationStep();
  }

  /**
   * Advances the current animation on a timed cadence and updates the facing direction.
   */
  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.animationIntervalMs)) return;

    this.lookAtCharacter();
    this.playAnimation(this.isRunningToCharacter() ? this.RUN : this.IDLE);
  }

  /**
   * Moves Alia toward the player until the preferred follow distance is restored.
   */
  followCharacter() {
    if (!this.world?.character) return;
    if (this.isWorldPaused()) return;

    let xDistance = this.world.character.x - this.x;

    if (Math.abs(xDistance) <= this.maxDistanceToCharacter) return;

    this.x += this.getFollowStep(xDistance);
  }

  /**
   * Computes the horizontal step Alia should take toward the player this frame.
   *
   * @param {number} xDistance Current horizontal distance to the player.
   * @returns {number} Signed horizontal step for this frame.
   */
  getFollowStep(xDistance) {
    let targetDistance = this.maxDistanceToCharacter - this.followTolerance;
    let direction = Math.sign(xDistance);
    let step = Math.min(Math.abs(xDistance) - targetDistance, this.speed);

    return direction * step;
  }

  /**
   * Checks whether Alia is still far enough from the player to use the running animation.
   *
   * @returns {boolean} `true` when Alia should be considered in a running follow state.
   */
  isRunningToCharacter() {
    if (!this.world?.character) return false;

    return Math.abs(this.world.character.x - this.x) > this.maxDistanceToCharacter;
  }

  /**
   * Reports whether Alia has settled into the intro idle pose on the ground.
   *
   * @returns {boolean} `true` when the intro logic should treat Alia as idle.
   */
  isIdleForIntro() {
    return this.hasLanded && !this.isAboveGround() && !this.isRunningToCharacter() && this.currentAnimation === this.IDLE;
  }

  /**
   * Flips Alia's sprite so she faces the player character.
   */
  lookAtCharacter() {
    if (!this.world?.character) return;

    this.imgDirectionChange = this.world.character.x < this.x;
  }

  /**
   * Resets the animation sequence when needed and displays the next frame.
   *
   * @param {string[]} images Animation frames to play.
   */
  playAnimation(images) {
    this.resetAnimationSequence(images);
    this.showAnimationFrame(images);
  }
}