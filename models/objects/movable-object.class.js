import { isLandingOn, landOn } from '../../js/colliding-objects.js';
import { DrawableObject } from './drawable-objects.class.js';

/**
 * Base class for drawable objects that can move and react to gravity/platforms.
 */
export class MovableObject extends DrawableObject {
  imgDirectionChange = false;
  vcY = 0;
  acY = 0.25;
  gravityEnabled = false;

  /**
   * Enables gravity updates for the object.
   *
   * @returns {void}
   */
  applyGravity() {
    this.gravityEnabled = true;
  }

  /**
   * Runs the default movement update step.
   *
   * @returns {void}
   */
  updateStep() {
    this.updateGravity();
  }

  /**
   * Applies vertical movement while the object is airborne.
   *
   * @returns {void}
   */
  updateGravity() {
    if (!this.gravityEnabled || !this.world || this.isWorldPaused()) return;

    if (this.isAboveGround() || this.vcY > 0) {
      this.y -= this.vcY;
      this.vcY -= this.acY;
    }
  }

  /**
   * @returns {{ x: number, y: number, width: number, height: number, offsetY: number }}
   */
  getCollisionArea() {
    return {
      x: this.x + 45,
      y: this.y + 35,
      width: this.width - 90,
      height: this.height - 60,
      offsetY: 30,
    };
  }

  /**
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < 379 && !this.isStandingOnPlatform();
  }

  /**
   * @returns {boolean}
   */
  isStandingOnPlatform() {
    let standableObjects = this.getStandableObjects();

    return standableObjects.some(platform => this.isLandingOn(platform));
  }

  /**
   * @returns {Array<*>}
   */
  getStandableObjects() {
    if (!this.world?.getStandableObjects) return [];

    return this.world.getStandableObjects();
  }

  /**
   * @param {*} platform
   * @returns {boolean}
   */
  isLandingOn(platform) {
    return isLandingOn(this, platform);
  }

  /**
   * @param {*} platform
   * @returns {void}
   */
  landOn(platform) {
    landOn(this, platform);
  }
}