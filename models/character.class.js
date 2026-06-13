class Character extends MovableObject {

  IDLE = CHARACTER_SPRITES.IDLE_ANIMATION;
  WALKING = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING = CHARACTER_SPRITES.JUMPING_ANIMATION;
  FLYING = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING = CHARACTER_SPRITES.FALLING_ANIMATION;
  SLASHING = CHARACTER_SPRITES.SLASHING_ANIMATION;
  HURT = CHARACTER_SPRITES.HURT_ANIMATION;

  y = 80;
  world;
  speed = 1;
  currentAnimation = null;
  energy = 100;
  slashAnimationActive = false;
  slashInputLocked = false;
  isHurtState = false;
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
    this.loadImages(this.SLASHING);
    this.loadImages(this.HURT);

    this.applyGravity();
    this.animation();
  }

  animation() {
    const isMoving = () => this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    const isRunning = () => this.world.keyboard.SHIFT && isMoving();

    //Movement
    setInterval(() => {
      if (this.isKnockedBack()) {
        this.x += this.knockbackDirection * this.knockbackSpeed; 
        if (this.isAboveGround()) {
          this.vcY = 1; // Add a slight vertical movement for knockback
          this.y -= 1; // Knockback effect with slight vertical movement
        }
      } else {
        if (this.world.keyboard.RIGHT && this.isHurtState == false) {
          this.x += this.speed;
          this.imgDirectionChange = false;
        }

        if (this.world.keyboard.LEFT && this.x > 0 && this.isHurtState == false) {
          this.x -= this.speed;
          this.imgDirectionChange = true;
        }
      }

      if (this.world.keyboard.UP && !this.isAboveGround()) {
        this.vcY = 6.75;
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    //Animation 
    setInterval(() => {
      this.updateSlashState();

      switch (true) {
        case this.isHurt():
          this.spriteAnimation(this.HURT);
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
            this.speed = 1;
          }
          break;
        default:
          this.spriteAnimation(this.IDLE);
      }
    }, 50);
  }

  updateSlashState() {
    if (this.world.keyboard.D && !this.slashInputLocked) {
      this.slashAnimationActive = true;
      this.slashInputLocked = true;
    }

    if (!this.world.keyboard.D) this.slashInputLocked = false;
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
    this.hurtUntil = Date.now() + duration;
    this.isHurtState = true;

    setTimeout(() => {
      this.isHurtState = false;
    }, duration + 555); // Ensure the hurt state lasts slightly longer than the animation
  }

  // Knockback handling
  isKnockedBack() {
    return this.knockbackUntil > Date.now();
  }

  startKnockback(duration = 333, speed = 5) {
    this.knockbackUntil = Date.now() + duration;
    this.knockbackSpeed = speed;
    this.knockbackDirection = this.imgDirectionChange ? 1 : -1;
  }

  // Slash attack handling
  playSlashAnimation() {
    this.spriteAnimation(this.SLASHING, false);

    if (this.currentAnimation === this.SLASHING && this.currentImage >= this.SLASHING.length - 1) {
      this.slashAnimationActive = false;
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