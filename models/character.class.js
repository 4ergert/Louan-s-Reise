class Character extends MovableObject {

  y = 80;
  IDLE = CHARACTER_SPRITES.IDLE_ANIMATION;
  WALKING = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING = CHARACTER_SPRITES.JUMPING_ANIMATION;
  FLYING = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING = CHARACTER_SPRITES.FALLING_ANIMATION;
  SLASHING = CHARACTER_SPRITES.SLASHING_ANIMATION;
  world;
  speed = 1;
  currentAnimation = null;
  slashAnimationActive = false;
  slashInputLocked = false;

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

    this.applyGravity();
    this.animation();
  }

  animation() {
    const isMoving = () => this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    const isRunning = () => this.world.keyboard.SHIFT && isMoving();

    //Movement
    setInterval(() => {
      if (this.world.keyboard.RIGHT) {
        this.x += this.speed;
        this.imgDirectionChange = false;
      }

      if (this.world.keyboard.LEFT && this.x > 0) {
        this.x -= this.speed;
        this.imgDirectionChange = true;
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
        case this.slashAnimationActive:
          this.playSlashAnimation();
          break;
        case this.isAboveGround() && this.vcY > 3:
          this.spriteAnimation(this.JUMPING, false); // Play the jumping animation once
          break;
        case this.isAboveGround() && this.vcY < -3: // Falling down fast
          this.spriteAnimation(this.FALLING);
          break;
        case this.isAboveGround():
          this.spriteAnimation(this.FLYING); // Play the flying animation while in the air
          break;
        case isRunning():
          this.spriteAnimation(this.RUNNING);
          this.speed = 5;
          break;
        case isMoving():
          this.spriteAnimation(this.WALKING);
          this.speed = 1;
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

  playSlashAnimation() {
    this.spriteAnimation(this.SLASHING, false);

    if (this.currentAnimation === this.SLASHING && this.currentImage >= this.SLASHING.length - 1) {
      this.slashAnimationActive = false;
    }
  }

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

  getCollisionArea() {
    return {
      x: this.x + 45,
      y: this.y + 35,
      width: this.width - 90,
      height: this.height - 60,
      offsetY: 30,
    };
  }
}