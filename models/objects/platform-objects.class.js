import { MovableObject } from './movable-object.class.js';

export class PlatformObjects extends MovableObject {
  constructor(imgPath, x, y, width, height) {
    super();
    this.imgPath = imgPath;
    this.loadImage(imgPath);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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