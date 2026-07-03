import { playSoundEffect } from '../../js/audio.js';
import { startKnockback } from '../character/char-animation-actions.js';
import { MovableObject } from '../objects/movable-object.class.js';
import { SKELETON_WARRIOR_2_SPRITES } from '../../js/sprites-path/skeleton-warrior-2-sprite.js';

export class SkeletonWarrior2 extends MovableObject {
  x = 200;
  y = 0;
  speed = 0.6;
  defaultSpeed = 0.6;
  throwSpeed = 1.8;
  moveDirection = -1;
  animationFrames = [];
  isDying = false;
  isDead = false;
  isThrownByBoss = false;
  dyingAnimationSpeed = 50;
  slashAnimationSpeed = 50;
  animationElapsed = 0;
  directionChangeRemainingMs = 0;
  isSlashing = false;
  slashHitTriggered = false;

  IDLE = SKELETON_WARRIOR_2_SPRITES.IDLE_ANIMATION;
  WALKING = SKELETON_WARRIOR_2_SPRITES.WALKING_ANIMATION;
  DYING = SKELETON_WARRIOR_2_SPRITES.DYING_ANIMATION;
  SLASHING = SKELETON_WARRIOR_2_SPRITES.SLASHING_ANIMATION;

  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.loadImage('./assets/img/Enemies/Skeleton_Warrior_2/PNG Sequences/Idle/0_Skeleton_Warrior_Idle_000.png');
    this.loadImages(this.IDLE);
    this.loadImages(this.WALKING);
    this.loadImages(this.DYING);
    this.loadImages(this.SLASHING);

    this.animationFrames = this.WALKING;

    this.applyGravity();
    this.resetDirectionTimer();
  }

  updateStep() {
    super.updateStep();
    if (this.isWorldPaused()) return;

    this.updateSlashingState();
    this.updatePatrolStep();
    this.updateAnimationStep();
    this.updateDirectionTimer();
  }

  updateAnimationStep() {
    let animationSpeed = this.isSlashing ? this.slashAnimationSpeed : this.dyingAnimationSpeed;

    if (!this.shouldAdvanceTimedStep('animationElapsed', animationSpeed)) return;

    let isLooping = !this.isDying;
    let frameIndex = this.showAnimationFrame(this.animationFrames, isLooping);

    if (this.isSlashing && !this.slashHitTriggered && frameIndex >= 4) {
      this.trySlashCharacterHit();
    }

    if (this.isSlashing && this.currentImage >= this.SLASHING.length - 1) {
      this.finishSlashAnimation();
    }
  }

  updateSlashingState() {
    if (!this.world || this.isDying || this.isDead) return;

    let shouldSlash = this.isCharacterWithinSlashRange();

    if (shouldSlash) {
      this.startSlashAnimation();
      return;
    }

    if (!this.isSlashing) {
      this.animationFrames = this.WALKING;
      return;
    }

    this.animationFrames = this.SLASHING;
  }

  updatePatrolStep() {
    if (!this.world) return;
    if (this.isSlashing) return;

    if (this.isThrownByBoss && this.vcY <= 0 && this.isStandingOnPlatform()) {
      this.isThrownByBoss = false;
      this.speed = this.defaultSpeed;
    }

    if (this.shouldReverseAtBlockedPlatform()) {
      this.moveDirection *= -1;
      this.imgDirectionChange = this.moveDirection < 0;
      return;
    }

    this.x += this.moveDirection * this.speed;
    this.imgDirectionChange = this.moveDirection < 0;
  }

  updateDirectionTimer() {
    if (this.isSlashing) return;

    this.directionChangeRemainingMs -= this.world?.updateStepMs ?? 0;

    if (this.directionChangeRemainingMs > 0 || this.isDying) return;

    this.moveDirection *= -1;
    this.resetDirectionTimer();
  }

  resetDirectionTimer() {
    this.directionChangeRemainingMs = 2000 + Math.random() * 3000;
  }

  launchFromBoss(direction, startX, startY) {
    this.x = startX;
    this.y = startY;
    this.moveDirection = direction;
    this.imgDirectionChange = direction < 0;
    this.speed = this.throwSpeed;
    this.vcY = 4;
    this.isThrownByBoss = true;
    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.WALKING;
    this.currentImage = 0;
  }

  die() {
    if (this.isDying || this.isDead) return this.DYING.length * this.dyingAnimationSpeed + 50;

    this.isDying = true;
    this.speed = 0;
    this.moveDirection = 0;
    this.isThrownByBoss = false;
    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.DYING;
    this.currentImage = 0;
    this.imgDirectionChange = false;

    const dyingDuration = this.DYING.length * this.dyingAnimationSpeed + 50;

    setTimeout(() => {
      this.isDead = true;
    }, dyingDuration);

    return dyingDuration;
  }

  getCollisionArea() {
    return {
      x: this.x + 50,
      y: this.y + 45,
      width: this.width - 100,
      height: this.height - 70,
      offsetY: 40,
    };
  }

  isAboveGround() {
    if (this.shouldKeepFallingIntoAbyss()) return true;

    return super.isAboveGround();
  }

  shouldKeepFallingIntoAbyss() {
    if (this.isStandingOnPlatform()) return false;
    if (!this.world) return false;

    return !this.hasStandableObjectBelow();
  }

  hasStandableObjectBelow() {
    let ownCollisionArea = this.getCollisionArea();
    let feet = ownCollisionArea.y + ownCollisionArea.height;

    return this.getStandableObjects().some((platform) => {
      let platformArea = platform.getCollisionArea();
      let overlapsHorizontally =
        ownCollisionArea.x + ownCollisionArea.width > platformArea.x &&
        ownCollisionArea.x < platformArea.x + platformArea.width;

      return overlapsHorizontally && platformArea.y >= feet;
    });
  }

  shouldReverseAtBlockedPlatform() {
    let nextPlatform = this.getNextPlatform();

    return this.isBlockedPlatform(nextPlatform);
  }

  getNextPlatform() {
    let nextCollisionArea = this.getNextCollisionArea();
    let nextFeet = nextCollisionArea.y + nextCollisionArea.height;
    let landingTolerance = Math.max(20, Math.abs(this.vcY) + 5);

    return (this.world?.lvl?.platformObjects ?? []).find((platform) => {
      let platformArea = platform.getCollisionArea();

      return (
        nextCollisionArea.x + nextCollisionArea.width > platformArea.x &&
        nextCollisionArea.x < platformArea.x + platformArea.width &&
        nextCollisionArea.y < platformArea.y &&
        nextFeet >= platformArea.y &&
        nextFeet <= platformArea.y + landingTolerance
      );
    }) ?? null;
  }

  getNextCollisionArea() {
    let collisionArea = this.getCollisionArea();

    return {
      ...collisionArea,
      x: collisionArea.x + this.moveDirection * this.speed,
    };
  }

  isBlockedPlatform(platform) {
    if (!platform?.imgPath) return false;

    return platform.imgPath.includes('Ground 10.png')
      || platform.imgPath.includes('Ground 12.png');
  }

  isCharacterWithinSlashRange() {
    let character = this.world?.character;

    if (!character || character.isDead || character.isDying) return false;

    let ownArea = this.getCollisionArea();
    let characterArea = character.getCollisionArea();
    let overlapsVertically =
      characterArea.y < ownArea.y + ownArea.height &&
      characterArea.y + characterArea.height > ownArea.y;

    if (!overlapsVertically) return false;

    let characterRightEdge = characterArea.x + characterArea.width;
    let ownRightEdge = ownArea.x + ownArea.width;
    let horizontalGap = Math.max(
      ownArea.x - characterRightEdge,
      characterArea.x - ownRightEdge,
      0
    );

    return horizontalGap <= 70;
  }

  startSlashAnimation() {
    if (this.isSlashing || this.isThrownByBoss) return;

    let characterCenterX = this.world.character.x + this.world.character.width / 2;
    let ownCenterX = this.x + this.width / 2;

    this.moveDirection = characterCenterX < ownCenterX ? -1 : 1;
    this.imgDirectionChange = this.moveDirection < 0;
    this.isSlashing = true;
    this.slashHitTriggered = false;
    this.animationFrames = this.SLASHING;
    this.currentImage = 0;
    playSoundEffect(this.world?.swordSlashingAudio);
  }

  trySlashCharacterHit() {
    let character = this.world?.character;

    this.slashHitTriggered = true;
    if (!character || character.isDead || character.isDying || character.isHurt()) return;
    if (!this.isCharacterWithinSlashRange()) return;

    startKnockback(character, this.x + this.width / 2);
    character.hit();
  }

  finishSlashAnimation() {
    if (this.isDying || this.isDead) return;

    let shouldKeepSlashing = this.isCharacterWithinSlashRange();

    this.isSlashing = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.WALKING;
    this.currentImage = 0;
  }
}