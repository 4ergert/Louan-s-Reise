import { DrawableObject } from './drawable-objects.class.js';

/**
 * Returning sword projectile thrown by the boss.
 */
export class BossSwordObject extends DrawableObject {
  /** @type {string} */
  img = './assets/img/Enemies/Skeleton_Warrior_3/PNG/Vector Parts/Sword.png';
  width = 240;
  height = 80;
  direction = -1;
  speed = 5.5;
  maxDistance = 400;
  traveledDistance = 0;
  returning = false;
  rotation = 0;
  rotationSpeed = 0.1;
  rotationDirection = -1;
  hasHitCharacter = false;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} direction
   */
  constructor(x, y, direction) {
    super();
    this.loadImage(this.img);
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.originX = x;
  }

  /**
   * @returns {void}
   */
  updateStep() {
    this.updateFlight();
  }

  /**
   * Advances the sword's boomerang flight and flips direction at max distance.
   *
   * @returns {void}
   */
  updateFlight() {
    let horizontalStep = this.speed * this.direction;

    this.x += horizontalStep;
    this.traveledDistance += Math.abs(horizontalStep);
    this.rotation += this.rotationSpeed * this.rotationDirection;

    if (!this.returning && this.traveledDistance >= this.maxDistance) {
      this.returning = true;
      this.direction *= -1;
    }
  }

  /**
   * @returns {boolean}
   */
  hasReturned() {
    if (!this.returning) return false;

    return Math.abs(this.x - this.originX) <= this.speed + 2;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    let centerX = this.x + this.width / 2;
    let centerY = this.y + this.height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotation);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  /**
   * @returns {{ x: number, y: number, width: number, height: number, offsetY: number }}
   */
  getCollisionArea() {
    return {
      x: this.x + 12,
      y: this.y + 12,
      width: this.width - 24,
      height: this.height - 24,
      offsetY: 0,
    };
  }
}