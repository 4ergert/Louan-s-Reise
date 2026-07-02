import { MovableObject } from '../objects/movable-object.class.js';
import { ALIA_SPRITES } from './alia-sprites.js';

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

  updateStep() {
    super.updateStep();
    this.followCharacter();
    this.updateAnimationStep();
  }

  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.animationIntervalMs)) return;

    this.lookAtCharacter();
    this.playAnimation(this.isRunningToCharacter() ? this.RUN : this.IDLE);
  }

  followCharacter() {
    if (!this.world?.character) return;
    if (this.isWorldPaused()) return;

    let xDistance = this.world.character.x - this.x;

    if (Math.abs(xDistance) <= this.maxDistanceToCharacter) return;

    let targetDistance = this.maxDistanceToCharacter - this.followTolerance;
    let direction = Math.sign(xDistance);
    let step = Math.min(Math.abs(xDistance) - targetDistance, this.speed);

    this.x += direction * step;
  }

  isRunningToCharacter() {
    if (!this.world?.character) return false;

    return Math.abs(this.world.character.x - this.x) > this.maxDistanceToCharacter;
  }

  isIdleForIntro() {
    return this.hasLanded && !this.isAboveGround() && !this.isRunningToCharacter() && this.currentAnimation === this.IDLE;
  }

  lookAtCharacter() {
    if (!this.world?.character) return;

    this.imgDirectionChange = this.world.character.x < this.x;
  }

  playAnimation(images) {
    this.resetAnimationSequence(images);
    this.showAnimationFrame(images);
  }
}