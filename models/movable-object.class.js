class MovableObject {
  x = 0;
  y;
  img;
  width = 150;
  height = 150;
  imgCache = {};
  currentImage = 0;
  imgDirectionChange = false;
  vcY = 0;
  acY = 0.25;

  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.vcY > 0) {
        this.y -= this.vcY;
        this.vcY -= this.acY;
      }
    }, 1000 / 60);
  }

  isAboveGround() {
    return this.y < 379 && !this.isStandingOnPlatform();
  }

  isStandingOnPlatform() {
    if (!this.world?.lvl?.platformObjects) {
      return false;
    }

    return this.world.lvl.platformObjects.some(platform => this.isLandingOn(platform));
  }

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach(path => {
      let img = new Image();
      img.src = path;
      this.imgCache[path] = img;
    });
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  drawFrame(ctx) {
    if (this instanceof Character || this instanceof SkeletonWarriorLVL1 || this instanceof PlatformObjects) {
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.strokeStyle = "red";
      if (this instanceof Character) {
        ctx.rect(this.x + 35, this.y + 30, this.width - 80, this.height - 55);
      } else if (this instanceof SkeletonWarriorLVL1) {
        ctx.rect(this.x + 30, this.y + 40, this.width - 60, this.height - 65);
      }
      else if (this instanceof PlatformObjects) {
        ctx.rect(this.x, this.y, this.width, this.height);
      };
      ctx.stroke();
    }
  }

  getHitbox() {
    if (this instanceof Character) {
      return {
        x: this.x + 35,
        y: this.y + 30,
        width: this.width - 80,
        height: this.height - 55,
        offsetY: 30,
      };
    }

    if (this instanceof SkeletonWarriorLVL1) {
      return {
        x: this.x + 30,
        y: this.y + 40,
        width: this.width - 60,
        height: this.height - 65,
        offsetY: 40,
      };
    }

    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      offsetY: 0,
    };
  }

  isColliding(movableObject) {
    let ownHitbox = this.getHitbox();
    let otherHitbox = movableObject.getHitbox();

    return (
      ownHitbox.x + ownHitbox.width > otherHitbox.x &&
      ownHitbox.x < otherHitbox.x + otherHitbox.width &&
      ownHitbox.y + ownHitbox.height > otherHitbox.y &&
      ownHitbox.y < otherHitbox.y + otherHitbox.height
    );
  }

  isLandingOn(platform) {
    let ownHitbox = this.getHitbox();
    let platformHitbox = platform.getHitbox();
    let feet = ownHitbox.y + ownHitbox.height;

    return (
      this.vcY <= 0 &&
      ownHitbox.x + ownHitbox.width > platformHitbox.x &&
      ownHitbox.x < platformHitbox.x + platformHitbox.width &&
      ownHitbox.y < platformHitbox.y &&
      feet >= platformHitbox.y &&
      feet <= platformHitbox.y + 20
    );
  }

  landOn(platform) {
    let ownHitbox = this.getHitbox();
    let platformHitbox = platform.getHitbox();

    this.y = platformHitbox.y - ownHitbox.height - ownHitbox.offsetY;
    this.vcY = 0;
  }
}