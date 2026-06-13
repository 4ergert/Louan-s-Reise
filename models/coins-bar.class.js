class CoinsBar extends DrawableObject {
  imgCoins = './img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 01.png';
  coins = 0;

  constructor() {
    super();
    this.loadImage(this.imgCoins);
    this.x = 16;
    this.y = 64;
    this.width = 40;
    this.height = 40;
  }

  draw(ctx) {
    super.draw(ctx);
    this.drawCoinsCount(ctx);
  }

  drawCoinsCount(ctx) {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#d9a441';
    ctx.strokeStyle = '#100a07';
    ctx.lineWidth = 5;
    ctx.strokeText(`${this.coins} Coins`, this.x + this.width + 12, this.y + this.height / 2 + 8);
    ctx.fillText(`${this.coins} Coins`, this.x + this.width + 12, this.y + this.height / 2 + 8);
  }
}