class Character extends MovableObject {

  IDLE_ANIMATION = CHARACTER_SPRITES.IDLE_ANIMATION;
  WALKING_ANIMATION = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING_ANIMATION = CHARACTER_SPRITES.RUNNING_ANIMATION;
  world;
  speed = 1;

  constructor() {
    super();
    this.loadImage('./img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE_ANIMATION);
    this.loadImages(this.WALKING_ANIMATION);
    this.loadImages(this.RUNNING_ANIMATION);

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

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    //Animation for moving
    setInterval(() => {

      if (isRunning()) {
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

        this.speed = 1;
      } else {
        let i = this.currentImage % this.IDLE_ANIMATION.length;
        let path = this.IDLE_ANIMATION[i];
        this.img = this.imgCache[path];
        this.currentImage++;
      }
    }, 50);
  }
}