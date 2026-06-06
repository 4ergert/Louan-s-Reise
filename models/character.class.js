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
  currentImage = 0;

  constructor() {
    super();
    this.loadImage('./img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE_ANIMATION);

    this.animation();
  }

  animation() {
    setInterval(() => {
      let i = this.currentImage % this.IDLE_ANIMATION.length;
      let path = this.IDLE_ANIMATION[i];
      this.img = this.imgCache[path];
      this.currentImage++;
    }, 100);
  }

  jump() {
    this.y -= 10;
  }

  moveLeft() {
    this.x -= 5;
  }
}