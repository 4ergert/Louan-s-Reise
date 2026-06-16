class LVL_1_Boss extends MovableObject {
  height = 500;
  width = 500;
  y = -10;
  x = 4400;
  speed = 0.15;
  imgDirectionChange = true;
  isBoss = true;
  maxEnergy = 5;
  energy = 5;
  isHurt = false;
  isDying = false;
  isDead = false;
  isSlashing = false;
  isSlashAnimationActive = false;
  slashHitTriggered = false;
  dyingAnimationSpeed = 100;
  animationFrames = [];
  hurtTimeout = null;

  WALKING = LVL_1_BOSS_SPRITES.WALKING_ANIMATION;
  HURT = LVL_1_BOSS_SPRITES.HURT_ANIMATION;
  DYING = LVL_1_BOSS_SPRITES.DYING_ANIMATION;
  SLASHING = LVL_1_BOSS_SPRITES.SLASHING_ANIMATION;

  constructor() {
    super().loadImage(this.WALKING[0]);
    this.loadImages(this.WALKING);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);
    this.loadImages(this.SLASHING);
    this.animationFrames = this.WALKING;
    this.animate();
  }

  playAnimation(images) {
    let isSingleRunAnimation = this.isDying || this.isHurt || this.isSlashAnimationActive;
    let i = isSingleRunAnimation
      ? Math.min(this.currentImage, images.length - 1)
      : this.currentImage % images.length;
    let path = images[i];
    this.img = this.imgCache[path];

    if (this.isSlashAnimationActive && !this.slashHitTriggered && i >= 4) {
      this.slashHitTriggered = true;
      this.world?.handleBossSlashHit?.();
    }

    if (isSingleRunAnimation && this.currentImage >= images.length - 1) {
      if (this.isHurt) this.finishHurtAnimation();
      if (this.isSlashAnimationActive) this.finishSlashAnimation();
      return;
    }

    if (!isSingleRunAnimation || this.currentImage < images.length - 1) {
      this.currentImage++;
    }
  }

  animate() {
    setInterval(() => {
      if (this.world?.isPaused) return;

      this.playAnimation(this.animationFrames);
    }, this.dyingAnimationSpeed);
  }

  hit() {
    if (this.isDying || this.isDead) return false;

    this.energy = Math.max(0, this.energy - 1);
    this.startHurtAnimation();
    if (this.energy > 0) return false;

    this.die();
    return true;
  }

  startHurtAnimation() {
    this.isHurt = true;
    this.animationFrames = this.HURT;
    this.currentImage = 0;

    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = setTimeout(() => {
      this.finishHurtAnimation();
    }, this.HURT.length * this.dyingAnimationSpeed + 50);
  }

  finishHurtAnimation() {
    if (this.isDying || !this.isHurt) return;

    this.isHurt = false;
    let shouldKeepSlashing = this.isSlashing || this.world?.isCharacterWithinBossSlashRange?.();
    this.isSlashing = shouldKeepSlashing;
    this.isSlashAnimationActive = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.WALKING;
    this.currentImage = 0;
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;
  }

  setSlashingState(isSlashing) {
    if (this.isDying || this.isDead || this.isHurt) return;
    if (isSlashing) {
      if (this.isSlashAnimationActive) return;

      this.isSlashing = true;
      this.isSlashAnimationActive = true;
      this.slashHitTriggered = false;
      this.animationFrames = this.SLASHING;
      this.currentImage = 0;
      return;
    }

    if (this.isSlashAnimationActive) return;
    if (!this.isSlashing) return;

    this.isSlashing = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.WALKING;
    this.currentImage = 0;
  }

  finishSlashAnimation() {
    if (!this.isSlashAnimationActive || this.isDying || this.isDead) return;

    let shouldKeepSlashing = this.world?.isCharacterWithinBossSlashRange?.() || false;
    this.isSlashAnimationActive = shouldKeepSlashing;
    this.isSlashing = shouldKeepSlashing;
    this.slashHitTriggered = false;
    this.animationFrames = shouldKeepSlashing ? this.SLASHING : this.WALKING;
    this.currentImage = 0;
  }

  die() {
    if (this.isDying || this.isDead) return this.DYING.length * this.dyingAnimationSpeed + 50;

    this.isDying = true;
    this.isHurt = false;
    this.isSlashing = false;
    this.isSlashAnimationActive = false;
    this.slashHitTriggered = false;
    this.animationFrames = this.DYING;
    this.currentImage = 0;
    if (this.hurtTimeout) clearTimeout(this.hurtTimeout);
    this.hurtTimeout = null;

    const dyingDuration = this.DYING.length * this.dyingAnimationSpeed + 50;
    setTimeout(() => {
      this.isDead = true;
    }, dyingDuration);

    return dyingDuration;
  }

  getCollisionArea() {
    return {
      x: this.x + 180,
      y: this.y + 230,
      width: this.width - 350,
      height: this.height - 400,
      offsetY: 30,
    };
  }
}