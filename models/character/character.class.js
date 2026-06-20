import { CHARACTER_SPRITES } from '../../js/sprites-path/character-sprites.js';
import { MovableObject } from '../objects/movable-object.class.js';

export class Character extends MovableObject {

  IDLE = CHARACTER_SPRITES.IDLE_ANIMATION;
  WALKING = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING = CHARACTER_SPRITES.JUMPING_ANIMATION;
  FLYING = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING = CHARACTER_SPRITES.FALLING_ANIMATION;
  THROWING = CHARACTER_SPRITES.THROWING_ANIMATION;
  SLASHING = CHARACTER_SPRITES.SLASHING_ANIMATION;
  HURT = CHARACTER_SPRITES.HURT_ANIMATION;
  DYING = CHARACTER_SPRITES.DYING_ANIMATION;

  x = -47;
  y = 280;
  world;
  speed = 1;
  currentAnimation = null;
  energy = 100;
  opacity = 0;
  spawnDuration = 800;
  spawnStartedAt = Date.now();
  throwingAnimationActive = false;
  slashAnimationActive = false;
  slashInputLocked = false;
  isHurtState = false;
  isDying = false;
  isDead = false;
  hurtUntil = 0;
  knockbackUntil = 0;
  knockbackDirection = 0;
  knockbackSpeed = 0;

  constructor() {
    super();
    this.loadImage('./img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE);
    this.loadImages(this.WALKING);
    this.loadImages(this.RUNNING);
    this.loadImages(this.JUMPING);
    this.loadImages(this.FLYING);
    this.loadImages(this.FALLING);
    this.loadImages(this.THROWING);
    this.loadImages(this.SLASHING);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);

    this.applyGravity();
    this.animation();
  }

  animation() {
    const isMoving = () => this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    const isRunning = () => this.world.keyboard.SHIFT && isMoving();

    //Movement
    setInterval(() => this.charMovement(), 1000 / 60);

    //Animation 
    setInterval(() => {
      if (this.world?.isPaused) return;

      this.updateSlashState();

      switch (true) {
        case this.isSpawning():
          this.spriteAnimation(this.IDLE);
          break;
        case this.isDying:
          this.playDyingAnimation();
          break;
        case this.isHurt():
          this.spriteAnimation(this.HURT);
          break;
        case this.throwingAnimationActive:
          this.playThrowingAnimation();
          break;
        case this.slashAnimationActive:
          this.playSlashAnimation();
          break;
        case this.isAboveGround() && this.vcY > 3:
          this.spriteAnimation(this.JUMPING, false); // Play the jumping animation once
          break;
        case this.isAboveGround() && this.vcY < -1: // Falling down fast
          this.spriteAnimation(this.FALLING);
          break;
        case this.isAboveGround():
          this.spriteAnimation(this.FLYING); // Play the flying animation while in the air
          break;
        case isRunning():
          if (!this.isHurtState) {
            this.spriteAnimation(this.RUNNING);
            this.speed = 4;
          }
          break;
        case isMoving():
          if (!this.isHurtState) {
            this.spriteAnimation(this.WALKING);
            this.speed = 2;
          }
          break;
        default:
          this.spriteAnimation(this.IDLE);
      }
    }, 50);
  }

  charMovement() {
    if (this.world?.isPaused) return;
    this.updateSpawnOpacity();

    if (this.shouldFreezeMovement()) {
      this.freezeMovement();
      return;
    }

    if (this.characterIsInKnockback()) this.knockback();
    else {
      if (this.allowsMoveRight()) this.moveRight();
      if (this.allowsMoveLeft()) this.moveLeft();
    }

    if (this.allowsToJump()) this.vcY = 6.75;

    this.freezeMovement();
  }

  updateSpawnOpacity() {
    let elapsedTime = Date.now() - this.spawnStartedAt;
    this.opacity = Math.min(1, elapsedTime / this.spawnDuration);
  }

  shouldFreezeMovement() {
    return this.isSpawning() || this.isDying || this.isDead;
  }

  freezeMovement() {
    this.world.camera_x = -this.x + 100;
  }

  characterIsInKnockback() {
    return this.knockbackUntil > Date.now();
  }

  knockback() {
    this.x += this.knockbackDirection * this.knockbackSpeed;
    if (this.isAboveGround()) {
      this.vcY = 1;
      this.y -= 1;
    }
  }

  allowsMoveRight() {
    return this.world.keyboard.RIGHT && this.isHurtState == false;
  }

  moveRight() {
    this.x += this.speed;
    this.imgDirectionChange = false;
  }

  allowsMoveLeft() {
    return this.world.keyboard.LEFT && this.isHurtState == false;
  }

  moveLeft() {
    this.x -= this.speed;
    this.imgDirectionChange = true;
  }

  allowsToJump() {
    return this.world.keyboard.UP && !this.isAboveGround();
  }

  updateSlashState() {
    if (this.isSpawning()) return;

    if (this.world.keyboard.D && !this.slashInputLocked) {
      this.slashAnimationActive = true;
      this.slashInputLocked = true;
    }

    if (!this.world.keyboard.D) this.slashInputLocked = false;
  }

  isSpawning() {
    return this.opacity < 1;
  }



  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    super.draw(ctx);
    ctx.restore();
  }

  getCollisionArea() {
    return {
      x: this.x + 45,
      y: this.y + 35,
      width: this.width - 90,
      height: this.height - 60,
      offsetY: 30,
    };
  }

  // Collision and damage handling
  isHurt() {
    return this.hurtUntil > Date.now();
  }

  hit(duration = 333) {
    this.energy = Math.max(0, this.energy - 20);
    this.world?.lifeBar.setPercentage(this.energy);

    if (this.energy === 0) {
      this.die();
      return;
    }

    this.hurtUntil = Date.now() + duration;
    this.isHurtState = true;

    setTimeout(() => this.isHurtState = false, duration + 555); // Ensure the hurt state lasts slightly longer than the animation
  }

  startKnockback(sourceX = null, duration = 333, speed = 5) {
    this.knockbackUntil = Date.now() + duration;
    this.knockbackSpeed = speed;
    if (sourceX === null) {
      this.knockbackDirection = this.imgDirectionChange ? 1 : -1;
      return;
    }

    let characterCenterX = this.x + this.width / 2;
    this.knockbackDirection = sourceX < characterCenterX ? 1 : -1;
  }

  startThrowingAnimation() {
    if (this.isDying || this.isDead) return;

    this.throwingAnimationActive = true;
  }

  die() {
    if (this.isDying || this.isDead) return;

    this.isDying = true;
    this.isHurtState = false;
    this.throwingAnimationActive = false;
    this.slashAnimationActive = false;
    this.knockbackUntil = 0;
    this.currentAnimation = null;
    this.currentImage = 0;
  }

  playThrowingAnimation() {
    this.spriteAnimation(this.THROWING, false);

    if (this.currentAnimation === this.THROWING && this.currentImage >= this.THROWING.length - 1) {
      this.throwingAnimationActive = false;
    }
  }

  // Slash attack handling
  playSlashAnimation() {
    this.spriteAnimation(this.SLASHING, false);

    if (this.currentAnimation === this.SLASHING && this.currentImage >= this.SLASHING.length - 1) {
      this.slashAnimationActive = false;
    }
  }

  playDyingAnimation() {
    this.spriteAnimation(this.DYING, false);

    if (this.currentAnimation === this.DYING && this.currentImage >= this.DYING.length - 1) {
      this.isDead = true;
    }
  }

  // Override the spriteAnimation method to reset the animation when switching states
  spriteAnimation(sprites, loop = true) {
    if (this.currentAnimation !== sprites) {
      this.currentAnimation = sprites;
      this.currentImage = 0;
    }

    let i = loop
      // Loop through the animation frames if loop is true, otherwise play the animation once
      ? this.currentImage % sprites.length
      // Play the animation once and stop at the last frame if loop is false
      : Math.min(this.currentImage, sprites.length - 1);
    let path = sprites[i];
    this.img = this.imgCache[path];

    if (loop || this.currentImage < sprites.length - 1) this.currentImage++;
  }


}