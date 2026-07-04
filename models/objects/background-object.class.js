import { MovableObject } from './movable-object.class.js';

/**
 * Background layer object with optional parallax scrolling.
 */
export class BackgroundObject extends MovableObject {

  /**
   * @param {string} imgPath
   * @param {number} [parallaxFactor=1]
   * @param {number} [x=0]
   * @param {number} [width=720]
   * @param {number} [height=480]
   */
  constructor(imgPath, parallaxFactor = 1, x = 0, width = 720, height = 480) {
    super();
    this.loadImage(imgPath);
    this.parallaxFactor = parallaxFactor;
    this.x = x;
    this.y = 0;
    this.width = width;
    this.height = height;
  }
}