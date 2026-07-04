import { isColliding } from '../../js/colliding-objects.js';

/**
 * Base drawable game object with image, animation, and collision helpers.
 */
export class DrawableObject {
  /** @type {HTMLImageElement | undefined} */
  img;
  /** @type {Record<string, HTMLImageElement>} */
  imgCache = {};
  currentImage = 0;
  x = 0;
  y = 0;
  width = 150;
  height = 150;
  showCollisionArea = false;

  /**
   * @param {string} path
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * @param {string[]} arr
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach(path => {
      let img = new Image();
      img.src = path;
      this.imgCache[path] = img;
    });
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Hook for per-step updates in subclasses.
   *
   * @returns {void}
   */
  updateStep() {
  }

  /**
   * @returns {boolean}
   */
  isWorldPaused() {
    return Boolean(this.world?.isPaused);
  }

  /**
   * Advances an elapsed-step accumulator and reports when an interval elapsed.
   *
   * @param {string} elapsedKey
   * @param {number} intervalMs
   * @returns {boolean}
   */
  shouldAdvanceTimedStep(elapsedKey, intervalMs) {
    this[elapsedKey] = (this[elapsedKey] ?? 0) + (this.world?.updateStepMs ?? 0);

    if (this[elapsedKey] < intervalMs) return false;

    this[elapsedKey] -= intervalMs;
    return true;
  }

  /**
   * Resets animation state when switching to a different animation.
   *
   * @param {string} nextAnimation
   * @param {(() => void) | null} [onReset=null]
   * @returns {boolean}
   */
  resetAnimationSequence(nextAnimation, onReset = null) {
    if (this.currentAnimation === nextAnimation) return false;

    this.currentAnimation = nextAnimation;
    this.currentImage = 0;
    onReset?.();
    return true;
  }

  /**
   * Displays the current animation frame and advances the frame index.
   *
   * @param {string[]} frames
   * @param {boolean} [loop=true]
   * @returns {number}
   */
  showAnimationFrame(frames, loop = true) {
    let frameIndex = loop
      ? this.currentImage % frames.length
      : Math.min(this.currentImage, frames.length - 1);
    let path = frames[frameIndex];

    this.img = this.imgCache[path];

    if (loop || this.currentImage < frames.length - 1) {
      this.currentImage++;
    }

    return frameIndex;
  }

  /**
   * Draws the collision area when debug rendering is enabled.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  drawCollisionArea(ctx) {
    if (!this.showCollisionArea) return;

    let collisionArea = this.getCollisionArea();

    ctx.beginPath();
    ctx.lineWidth = '2';
    ctx.strokeStyle = 'red';
    ctx.rect(
      collisionArea.x,
      collisionArea.y,
      collisionArea.width,
      collisionArea.height
    );
    ctx.stroke();
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

  /**
   * @param {*} otherObject
   * @returns {boolean}
   */
  isColliding(otherObject) {
    return isColliding.call(this, otherObject);
  }
}