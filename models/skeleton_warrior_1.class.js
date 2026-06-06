class SkeletonWarriorLVL1 extends MovableObject {
  
  constructor() {
    super().loadImage('./img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_000.png');

    this.x = 200 + Math.random() * 500;
  }
}