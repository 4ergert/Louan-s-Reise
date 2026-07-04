import { MovableObject } from './movable-object.class.js';

/**
 * Static platform object that can be stood on.
 */
export class PlatformObjects extends MovableObject {
  /**
   * @param {string} imgPath
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(imgPath, x, y, width, height) {
    super();
    this.imgPath = imgPath;
    this.loadImage(imgPath);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * @returns {{ x: number, y: number, width: number, height: number, offsetY: number }}
   */
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