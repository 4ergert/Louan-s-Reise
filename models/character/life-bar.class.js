import { DrawableObject } from '../objects/drawable-objects.class.js';

export class LifeBar extends DrawableObject {
  imgLife ='./assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Life.png';
  percentage = 100;
  maxSegments = 5;

  constructor() {
    super();
    this.loadImage(this.imgLife);
    this.x = 16;
    this.y = 16;
    this.width = 40;
    this.height = 40;
  }

  draw(ctx) {
    super.draw(ctx);
    this.drawLifeSegments(ctx);
  }

  drawLifeSegments(ctx) {
    let filledSegments = Math.ceil((this.percentage / 100) * this.maxSegments);
    let segmentWidth = 8;
    let segmentHeight = 24;
    let gap = 6;
    let startX = this.x + this.width + 12;
    let startY = this.y + (this.height - segmentHeight) / 2;

    for (let i = 0; i < this.maxSegments; i++) {
      ctx.fillStyle = i < filledSegments ? this.getSegmentColor() : '#5b4b39';
      ctx.fillRect(startX + i * (segmentWidth + gap), startY, segmentWidth, segmentHeight);

      ctx.strokeStyle = '#1f140d';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX + i * (segmentWidth + gap), startY, segmentWidth, segmentHeight);
    }
  }

  getSegmentColor() {
    if (this.percentage > 90) return '#47b36b';
    if (this.percentage > 30) return '#d9a441';
    return '#c84c3b';
  }

  setPercentage(percentage) {
    this.percentage = Math.max(0, Math.min(100, percentage));
  }
}