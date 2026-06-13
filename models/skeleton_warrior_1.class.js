class SkeletonWarriorLVL1 extends MovableObject {
  y = 280;
  speed = 0.4;
  moveDirection = -1;
  animationFrames = [];
  isDying = false;
  isDead = false;
  animationInterval = null;
  patrolInterval = null;
  directionTimeout = null;

  IDLE = skeletonWarriorSprites.IDLE_ANIMATION;
  WALKING = skeletonWarriorSprites.WALKING_ANIMATION;
  DYING = skeletonWarriorSprites.DYING_ANIMATION;

  constructor() {
    super();
    this.loadImage('./img/Enemies/Skeleton_Warrior_1/Idle/0_Skeleton_Warrior_Idle_000.png');
    this.loadImages(this.IDLE);
    this.loadImages(this.WALKING);
    this.loadImages(this.DYING);
    
    this.animationFrames = this.WALKING;

    this.x = 700 + Math.random() * 5000;

    this.animation();
    this.startPatrol();
  }

  animation() {
    this.animationInterval = setInterval(() => {
      let i = this.isDying
        ? Math.min(this.currentImage, this.animationFrames.length - 1)
        : this.currentImage % this.animationFrames.length;
      let path = this.animationFrames[i];
      this.img = this.imgCache[path];

      if (!this.isDying || this.currentImage < this.animationFrames.length - 1) {
        this.currentImage++;
      }
    }, 100);
  }

  startPatrol() {
    this.patrolInterval = setInterval(() => {
      this.x += this.moveDirection * this.speed;
      this.imgDirectionChange = this.moveDirection < 0;
    }, 1000 / 60);

    this.scheduleDirectionChange();
  }

  scheduleDirectionChange() {
    const nextChangeInMs = 2000 + Math.random() * 3000;

    this.directionTimeout = setTimeout(() => {
      if (this.isDying) return;
      this.moveDirection *= -1;
      this.scheduleDirectionChange();
    }, nextChangeInMs);
  }

  die() {
    if (this.isDying || this.isDead) return this.DYING.length * 75;

    this.isDying = true;
    this.speed = 0;
    this.moveDirection = 0;
    this.animationFrames = this.DYING;
    this.currentImage = 0;
    this.imgDirectionChange = false;

    clearInterval(this.patrolInterval);
    clearTimeout(this.directionTimeout);

    const dyingDuration = this.DYING.length *  75;

    setTimeout(() => {
      this.isDead = true;
    }, dyingDuration);

    return dyingDuration;
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