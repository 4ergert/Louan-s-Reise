import { LVL_1_BOSS_SPRITES } from '../../js/sprites-path/lvl-1-boss-sprites.js';
import { MovableObject } from '../objects/movable-object.class.js';

export class LVL_1_Boss extends MovableObject {
  height = 500;
  width = 500;
  y = -10;
  x = 4200;
  speed = 0.4;
  imgDirectionChange = true;
  isBoss = true;
  maxEnergy = 5;
  energy = 5;
  isHurt = false;
  isDying = false;
  isDead = false;
  isSlashing = false;
  isSlashAnimationActive = false;
  isThrowingAnimationActive = false;
  slashHitTriggered = false;
  skeletonThrowTriggered = false;
  thrownSkeletonCount = 0;
  dyingAnimationSpeed = 100;
  animationFrames = [];
  hurtTimeout = null;
  animationElapsed = 0;
  skeletonThrowElapsed = 0;

  IDLE = LVL_1_BOSS_SPRITES.IDLE_ANIMATION;
  WALKING = LVL_1_BOSS_SPRITES.WALKING_ANIMATION;
  HURT = LVL_1_BOSS_SPRITES.HURT_ANIMATION;
  DYING = LVL_1_BOSS_SPRITES.DYING_ANIMATION;
  SLASHING = LVL_1_BOSS_SPRITES.SLASHING_ANIMATION;
  THROWING = LVL_1_BOSS_SPRITES.THROWING_ANIMATION;

  constructor() {
    super().loadImage(this.IDLE[0]);
    this.loadImages(this.IDLE);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);
    this.loadImages(this.SLASHING);
    this.loadImages(this.THROWING);
    this.loadImages(this.WALKING);
    this.animationFrames = this.IDLE;
  }

  getDefaultAnimation() {
    return this.canWalkLeft() ? this.WALKING : this.IDLE;
  }

  updateStep() {
    if (this.isWorldPaused()) return;

    this.updateMovementStep();
    this.updateAnimationStep();
    this.updateSkeletonThrowStep();
  }

  updateMovementStep() {
    if (!this.canWalkLeft()) return;

    this.x -= this.speed;
  }

  canWalkLeft() {
    if (!this.world || this.isWorldPaused()) return false;
    if (this.world.character?.isDying || this.world.character?.isDead) return false;
    if (!this.world.bossIntroTriggered || this.world.isBossIntroActive?.()) return false;
    if (this.isDead || this.isDying || this.isHurt) return false;
    if (this.thrownSkeletonCount < 1) return false;
    return !this.isThrowingAnimationActive;
  }

  updateSkeletonThrowStep() {
    this.skeletonThrowElapsed += this.world?.updateStepMs ?? 0;

    if (this.skeletonThrowElapsed < 5000) return;

    this.skeletonThrowElapsed -= 5000;
    if (this.canStartSkeletonThrow()) this.startSkeletonThrowAnimation();
  }

  canStartSkeletonThrow() {
    if (!this.world || this.isWorldPaused()) return false;
    if (this.world.character?.isDying || this.world.character?.isDead) return false;
    if (this.isDying || this.isDead || this.isHurt) return false;
    if (this.isSlashing || this.isSlashAnimationActive || this.isThrowingAnimationActive) return false;
    if (this.world.isBossIntroActive?.()) return false;
    return this.world.bossIntroTriggered;
  }

  startSkeletonThrowAnimation() {
    if (this.world?.character?.isDying || this.world?.character?.isDead) return;

    this.isThrowingAnimationActive = true;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.THROWING;
    this.currentImage = 0;
  }

  playAnimation(images) {
    let isSingleRunAnimation = this.isDying || this.isHurt || this.isSlashAnimationActive || this.isThrowingAnimationActive;
    let i = this.showAnimationFrame(images, !isSingleRunAnimation);

    if (this.isSlashAnimationActive && !this.slashHitTriggered && i >= 4) {
      this.slashHitTriggered = true;
      this.world?.handleBossSlashHit?.();
    }

    if (this.isThrowingAnimationActive && !this.skeletonThrowTriggered && i >= 4) {
      if (this.world?.character?.isDying || this.world?.character?.isDead) {
        this.finishThrowingAnimation();
        return;
      }

      this.skeletonThrowTriggered = true;
      this.thrownSkeletonCount++;
      if (this.thrownSkeletonCount % 3 === 0) {
        this.world?.spawnBossSwordBoomerang?.();
      } else {
        this.world?.spawnSkeletonWarriorFromBoss?.();
      }
    }

    if (isSingleRunAnimation && this.currentImage >= images.length - 1) {
      if (this.isHurt) this.finishHurtAnimation();
      if (this.isSlashAnimationActive) this.finishSlashAnimation();
      if (this.isThrowingAnimationActive) this.finishThrowingAnimation();
      return;
    }

  }

  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.dyingAnimationSpeed)) return;

    this.playAnimation(this.animationFrames);
  }

  hit() {
    if (this.isDying || this.isDead) return false;

    this.energy = Math.max(0, this.energy - 1);
    this.startHurtAnimation();
    if (this.energy > 0) return false;

    this.die();
    return true;
  }

  startHurtAnimation() {
    this.isHurt = true;
    this.animationFrames = this.HURT;
    this.currentImage = 0;

    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = setTimeout(() => {
      this.finishHurtAnimation();
    }, this.HURT.length * this.dyingAnimationSpeed + 50);
  }

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

  setSlashingState(isSlashing) {
    if (this.isDying || this.isDead || this.isHurt) return;
    if (isSlashing) {
      if (this.isSlashAnimationActive) return;

      this.isSlashing = true;
      this.isSlashAnimationActive = true;
      this.slashHitTriggered = false;
      this.animationFrames = this.SLASHING;
      this.currentImage = 0;
      return;
    }

    if (this.isSlashAnimationActive) return;
    if (!this.isSlashing) return;

    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.getDefaultAnimation();
    this.currentImage = 0;
  }

  finishSlashAnimation() {
    if (!this.isSlashAnimationActive || this.isDying || this.isDead) return;

    let shouldKeepSlashing = this.world?.isCharacterWithinBossSlashRange?.() || false;
    this.isSlashAnimationActive = shouldKeepSlashing;
    this.isSlashing = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.getDefaultAnimation();
    this.currentImage = 0;
  }

  finishThrowingAnimation() {
    if (!this.isThrowingAnimationActive || this.isDying || this.isDead) return;

    this.isThrowingAnimationActive = false;
    this.skeletonThrowTriggered = false;
    this.animationFrames = this.getDefaultAnimation();
    this.currentImage = 0;
  }

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

  die() {
    if (this.isDying || this.isDead) return this.DYING.length * this.dyingAnimationSpeed + 50;

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
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;
    const dyingDuration = this.DYING.length * this.dyingAnimationSpeed + 50;
    setTimeout(() => {
      this.isDead = true;
    }, dyingDuration);

    return dyingDuration;
  }

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