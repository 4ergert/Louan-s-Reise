import { SKELETON_WARRIOR_1_SPRITES } from '../../sprites-path/skeleton-warrior-1-sprites.js';
import { SkeletonEnemyBase } from './skeleton-enemy-base.class.js';

/**
 * Ground enemy for level 1 that patrols platforms, can be thrown by the boss,
 * and transitions through a timed death animation.
 */
export class SkeletonWarrior1 extends SkeletonEnemyBase {
  speed = 0.4;
  defaultSpeed = 0.4;
  IDLE = SKELETON_WARRIOR_1_SPRITES.IDLE_ANIMATION;
  WALKING = SKELETON_WARRIOR_1_SPRITES.WALKING_ANIMATION;
  DYING = SKELETON_WARRIOR_1_SPRITES.DYING_ANIMATION;

  /**
   * @param {number} x Initial horizontal position.
   * @param {number} y Initial vertical position.
   */
  constructor(x, y) {
    super();
    this.initializePatrolEnemy(
      x,
      y,
      './assets/img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_000.png',
      [this.IDLE, this.WALKING, this.DYING],
      this.WALKING,
    );
  }

  /**
   * Advances physics, movement, animation, and timed direction changes for one game step.
   */
  updateStep() {
    super.updateStep();
    if (this.isWorldPaused()) return;

    this.updatePatrolStep();
    this.updateAnimationStep();
    this.updateDirectionTimer();
  }

  /**
   * Advances the current animation frame on the configured death-animation timing.
   */
  updateAnimationStep() {
    this.updateTimedAnimationStep('animationElapsed', this.dyingAnimationSpeed, this.animationFrames, !this.isDying);
  }

}