class MovableObject extends DrawableObject {
  imgDirectionChange = false;
  vcY = 0;
  acY = 0.25;

  applyGravity() {
    setInterval(() => {
      if (this.world?.isPaused) return;

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
    if (!this.world?.lvl?.platformObjects) 
      return false;
    return this.world.lvl.platformObjects.some(platform => this.isLandingOn(platform));
  }
}