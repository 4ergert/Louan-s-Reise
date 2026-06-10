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

  // drawFrame(ctx) {
  //   if (this instanceof Character || this instanceof SkeletonWarriorLVL1 || this instanceof PlatformObjects) {
  //     ctx.beginPath();
  //     ctx.lineWidth = "1";
  //     ctx.strokeStyle = "red";
  //     if (this instanceof Character) {
  //       ctx.rect(this.x + 35, this.y + 30, this.width - 80, this.height - 55);
  //     } else if (this instanceof SkeletonWarriorLVL1) {
  //       ctx.rect(this.x + 30, this.y + 40, this.width - 60, this.height - 65);
  //     }
  //     else if (this instanceof PlatformObjects) {
  //       ctx.rect(this.x, this.y, this.width, this.height);
  //     };
  //     ctx.stroke();
  //   }
  // }

  getCollisionArea() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      offsetY: 0,
    };
  }
}