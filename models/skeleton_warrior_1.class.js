class SkeletonWarriorLVL1 extends MovableObject {

  y = 280;

  IDLE_ANIMATION = [
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_000.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_001.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_002.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_003.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_004.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_005.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_006.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_007.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_008.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_009.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_010.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_011.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_012.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_013.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_014.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_015.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_016.png',
    './img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_017.png',
  ];

  constructor() {
    super();
    this.loadImage('./img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_000.png');
    this.loadImages(this.IDLE_ANIMATION);

    this.x = 100 + Math.random() * 500;

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

  getCollisionArea() {
    return {
      x: this.x + 50,
      y: this.y + 45,
      width: this.width - 100,
      height: this.height - 70,
      offsetY: 40,
    };
  }
}