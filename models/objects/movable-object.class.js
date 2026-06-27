import { isLandingOn, landOn } from '../../js/colliding-objects.js';
import { DrawableObject } from './drawable-objects.class.js';

export class MovableObject extends DrawableObject {
  imgDirectionChange = false;
  vcY = 0;
  acY = 0.25;

  applyGravity() {
    setInterval(() => {
      if (!this.world) return;
      if (this.world?.isPaused) return;

      if (this.isAboveGround() || this.vcY > 0) {
        this.y -= this.vcY;
        this.vcY -= this.acY;
      }
    }, 1000 / 60);
  }

  getCollisionArea() {
    return {
      x: this.x + 45,
      y: this.y + 35,
      width: this.width - 90,
      height: this.height - 60,
      offsetY: 30,
    };
  }

  isAboveGround() {
    return this.y < 379 && !this.isStandingOnPlatform();
  }

  isStandingOnPlatform() {
    let standableObjects = this.getStandableObjects();

    return standableObjects.some(platform => this.isLandingOn(platform));
  }

  getStandableObjects() {
    if (!this.world?.lvl) return [];

    return [
      ...(this.world.lvl.platformObjects ?? []),
      ...(this.world.lvl.solidObjects ?? []),
    ];
  }

  isLandingOn(platform) {
    return isLandingOn(this, platform);
  }

  landOn(platform) {
    landOn(this, platform);
  }
}