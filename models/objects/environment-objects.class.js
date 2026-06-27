import { MovableObject } from './movable-object.class.js';

export class EnvironmentObject extends MovableObject {
  constructor(imgPath, x, y, width, height) {
    super();
    this.setImage(imgPath);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  setImage(imgPath) {
    this.imgPath = imgPath;
    this.img = new Image();
    this.img.src = imgPath;
  }

  unlock() {
    if (!this.unlockImagePath || this.isUnlocked) return;

    this.isUnlocked = true;
    this.setImage(this.unlockImagePath);
  }

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