class Character extends MovableObject {

  y = 80;
  IDLE_ANIMATION = CHARACTER_SPRITES.IDLE_ANIMATION;
  WALKING_ANIMATION = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING_ANIMATION = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING_ANIMATION = CHARACTER_SPRITES.JUMPING_ANIMATION;
  JUMPING_LOOP_ANIMATION = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING_ANIMATION = CHARACTER_SPRITES.FALLING_ANIMATION;
  world;
  speed = 1;

  constructor() {
    super();
    this.loadImage('./img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE_ANIMATION);
    this.loadImages(this.WALKING_ANIMATION);
    this.loadImages(this.RUNNING_ANIMATION);
    this.loadImages(this.JUMPING_ANIMATION);
    this.loadImages(this.JUMPING_LOOP_ANIMATION);
    this.loadImages(this.FALLING_ANIMATION);

    this.applyGravity();
    this.animation();
  }

  animation() {
    const isMoving = () => this.world.keyboard.RIGHT || this.world.keyboard.LEFT;
    const isRunning = () => this.world.keyboard.CTRL && isMoving();

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

      if(this.world.keyboard.UP && !this.isAboveGround()) {
        this.vcY = 6.75;
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    //Animation for moving
    setInterval(() => {

      if (this.isAboveGround()) {
        let i = this.currentImage % this.START_ANIMATION.length;
        let path = this.FALLING_ANIMATION[i];
        this.img = this.imgCache[path];
        this.currentImage++;
      } else if (isRunning()) {
        let i = this.currentImage % this.RUNNING_ANIMATION.length;
        let path = this.RUNNING_ANIMATION[i];
        this.img = this.imgCache[path];
        this.currentImage++;

        this.speed = 5;
      } else if (isMoving()) {
        let i = this.currentImage % this.WALKING_ANIMATION.length;
        let path = this.WALKING_ANIMATION[i];
        this.img = this.imgCache[path];
        this.currentImage++;

        this.speed = 0.5;
      } else {
        let i = this.currentImage % this.IDLE_ANIMATION.length;
        let path = this.IDLE_ANIMATION[i];
        this.img = this.imgCache[path];
        this.currentImage++;
      }
    }, 50);
  }
}