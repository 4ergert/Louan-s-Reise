class Character extends MovableObject {

  IDLE_ANIMATION = [
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_001.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_002.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_003.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_004.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_005.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_006.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_007.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_008.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_009.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_010.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_011.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_012.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_013.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_014.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_015.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_016.png',
    './img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_017.png',
  ];
  WALKING_ANIMATION = [
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_000.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_001.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_002.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_003.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_004.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_005.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_006.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_007.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_008.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_009.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_010.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_011.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_012.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_013.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_014.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_015.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_016.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_017.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_018.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_019.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_020.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_021.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_022.png',
    './img/Character/lvl_1/Walking/0_Dark_Oracle_Walking_023.png',
  ];
  RUNNING_ANIMATION = [
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_000.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_001.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_002.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_003.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_004.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_005.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_006.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_007.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_008.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_009.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_010.png',
    './img/Character/lvl_1/Running/0_Dark_Oracle_Running_011.png',
  ];
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

      if (this.world.keyboard.LEFT) {
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