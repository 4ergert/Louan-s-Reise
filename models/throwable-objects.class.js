class ThrowableObject extends DrawableObject {
  img = './img/Environment/Autumn_Forest_2D_Platformer_Tileset_Environment - Rock 04.png';
  throwable = true;
  rooks = 0;

  constructor() {
    super();
    this.loadImage(this.img);
    this.width = 40;
    this.height = 40;
    this.x = 16;
    this.y = 111;
  }

  draw(ctx) {
    super.draw(ctx);
    this.drawRookCount(ctx);
  }

    drawRookCount(ctx) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#d9a441';
    ctx.strokeStyle = '#100a07';
    ctx.lineWidth = 5;
    ctx.strokeText(`${this.rooks} Rooks`, this.x + this.width + 12, this.y + this.height / 2 + 8);
    ctx.fillText(`${this.rooks} Rooks`, this.x + this.width + 12, this.y + this.height / 2 + 8);
  }
}