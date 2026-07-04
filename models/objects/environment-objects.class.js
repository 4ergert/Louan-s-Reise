import { MovableObject } from './movable-object.class.js';

/**
 * Static or interactable environment object.
 */
export class EnvironmentObject extends MovableObject {
  /**
   * @param {string} imgPath
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(imgPath, x, y, width, height) {
    super();
    this.setImage(imgPath);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * @param {string} imgPath
   * @returns {void}
   */
  setImage(imgPath) {
    this.imgPath = imgPath;
    this.img = new Image();
    this.img.src = imgPath;
  }

  /**
   * Switches the object to its unlocked image when available.
   *
   * @returns {boolean}
   */
  unlock() {
    if (!this.unlockImagePath || this.isUnlocked) return false;

    this.isUnlocked = true;
    this.setImage(this.unlockImagePath);
    return true;
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