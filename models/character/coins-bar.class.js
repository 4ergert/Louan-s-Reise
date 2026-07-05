import { DrawableObject } from '../objects/drawable-objects.class.js';

/**
 * HUD element that displays the current collected coin count.
 */
export class CoinsBar extends DrawableObject {
  imgCoins = './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 01.png';
  coins = 0;

  /**
   * Creates the coin counter icon and positions it on the HUD.
   */
  constructor() {
    super();
    this.loadImage(this.imgCoins);
    this.x = 16;
    this.y = 64;
    this.width = 40;
    this.height = 40;
  }

  /**
   * Draws the coin icon and the current coin count.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering context used for HUD drawing.
   */
  draw(ctx) {
    super.draw(ctx);
    this.drawCoinsCount(ctx);
  }

  /**
   * Draws the formatted coin total next to the coin icon.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering context used for text drawing.
   */
  drawCoinsCount(ctx) {
    ctx.font = '20px Uncial Antiqua';
    ctx.fillStyle = '#d9a441';
    ctx.strokeStyle = '#100a07';
    ctx.lineWidth = 5;
    ctx.strokeText(`${this.coins} Coins`, this.x + this.width + 12, this.y + this.height / 2 + 8);
    ctx.fillText(`${this.coins} Coins`, this.x + this.width + 12, this.y + this.height / 2 + 8);
  }

  /**
   * Increases the displayed coin count.
   *
   * @param {number} [amount=1] Number of coins to add.
   */
  addCoin(amount = 1) {
    this.coins += amount;
  }
}