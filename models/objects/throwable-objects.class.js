import { DrawableObject } from './drawable-objects.class.js';

export class ThrowableObject extends DrawableObject {
  img = './img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Rock 02.png';
  throwable = true;
  rooks = 0;
  showCount = false;
  baseY = 0;
  floatPhase = 0;
  isFlying = false;
  speedX = 0;
  speedY = 0;

  constructor(x = 16, y = 111, showCount = false) {
    super();
    this.loadImage(this.img);
    this.width = 40;
    this.height = 40;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.showCount = showCount;
    if (!this.showCount) {
      this.animateFloat();
    }
  }

  draw(ctx) {
    super.draw(ctx);
    if (this.showCount) {
      this.drawRookCount(ctx);
    }
  }

  addRook(amount = 1) {
    this.rooks += amount;
  }

  removeRook(amount = 1) {
    this.rooks = Math.max(0, this.rooks - amount);
  }

  animateFloat() {
    setInterval(() => {
      if (this.world?.isPaused) return;
      if (this.isFlying) return;
      this.floatPhase += 0.08;
      this.y = this.baseY + Math.sin(this.floatPhase) * 2;
    }, 1000 / 40);
  }

  launch(direction) {
    this.isFlying = true;
    this.speedX = 5 * direction;
    this.speedY = -3.5;
  }

  updateThrow() {
    if (this.world?.isPaused) return;
    if (!this.isFlying) return;

    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.18;
  }

  isOffscreen(cameraX, canvasWidth) {
    return this.x + this.width < -cameraX - 100 || this.x > -cameraX + canvasWidth + 100 || this.y > 430;
  }

    drawRookCount(ctx) {
    ctx.font = '20px Cinzel Decorative';
    ctx.fillStyle = '#d9a441';
    ctx.strokeStyle = '#100a07';
    ctx.lineWidth = 5;
    ctx.strokeText(`${this.rooks} Rooks`, this.x + this.width + 12, this.y + this.height / 2 + 8);
    ctx.fillText(`${this.rooks} Rooks`, this.x + this.width + 12, this.y + this.height / 2 + 8);
  }
}