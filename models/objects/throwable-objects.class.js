import { DrawableObject } from './drawable-objects.class.js';

/**
 * Throwable bone object used both as pickup count display and projectile.
 */
export class ThrowableObject extends DrawableObject {
  /** @type {string} */
  img = './assets/img/Enemies/Skeleton_Warrior_3/PNG/Vector Parts/Left Arm.png';
  throwable = true;
  bones = 0;
  showCount = false;
  baseY = 0;
  floatPhase = 0;
  isFlying = false;
  speedX = 0;
  speedY = 0;
  floatElapsed = 0;
  floatIntervalMs = 25;

  /**
   * @param {number} [x=12]
   * @param {number} [y=100]
   * @param {boolean} [showCount=false]
   */
  constructor(x = 12, y = 100, showCount = false) {
    super();
    this.loadImage(this.img);
    this.width = 55;
    this.height = 55;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.showCount = showCount;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  draw(ctx) {
    super.draw(ctx);
    if (this.showCount) {
      this.drawBoneCount(ctx);
    }
  }

  /**
   * @param {number} [amount=1]
   * @returns {void}
   */
  addBone(amount = 1) {
    this.bones += amount;
  }

  /**
   * @param {number} [amount=1]
   * @returns {void}
   */
  removeBone(amount = 1) {
    this.bones = Math.max(0, this.bones - amount);
  }

  /**
   * Runs the floating or projectile update for the current step.
   *
   * @returns {void}
   */
  updateStep() {
    if (this.isWorldPaused()) return;

    if (this.isFlying) {
      this.updateThrow();
      return;
    }

    if (this.showCount) return;

    if (!this.shouldAdvanceTimedStep('floatElapsed', this.floatIntervalMs)) return;

    this.floatPhase += 0.08;
    this.y = this.baseY + Math.sin(this.floatPhase) * 2;
  }

  /**
   * Launches the bone as a projectile.
   *
   * @param {number} direction
   * @returns {void}
   */
  launch(direction) {
    this.isFlying = true;
    this.speedX = 5 * direction;
    this.speedY = -3.5;
  }

  /**
   * Advances the thrown bone projectile.
   *
   * @returns {void}
   */
  updateThrow() {
    if (this.isWorldPaused()) return;
    if (!this.isFlying) return;

    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.18;
  }

  /**
   * @param {number} cameraX
   * @param {number} canvasWidth
   * @returns {boolean}
   */
  isOffscreen(cameraX, canvasWidth) {
    return this.x + this.width < -cameraX - 100 || this.x > -cameraX + canvasWidth + 100 || this.y > 430;
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   * @returns {void}
   */
  drawBoneCount(ctx) {
    ctx.font = '20px Uncial Antiqua';
    ctx.fillStyle = '#d9a441';
    ctx.strokeStyle = '#100a07';
    ctx.lineWidth = 5;
    ctx.strokeText(`${this.bones} Bones`, this.x + this.width + 4, this.y + this.height / 2 + 8);
    ctx.fillText(`${this.bones} Bones`, this.x + this.width + 4, this.y + this.height / 2 + 8);
  }
}