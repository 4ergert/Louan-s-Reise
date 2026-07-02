import { DrawableObject } from './drawable-objects.class.js';

export class Coins extends DrawableObject {
  x = 0;
  y = 0;
  width = 40;
  height = 40;
  animationElapsed = 0;
  animationIntervalMs = 100;

  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
    this.loadImage(this.IMAGES_COINS[0]);
    this.loadImages(this.IMAGES_COINS);
  }

  IMAGES_COINS = [
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 01.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 02.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 03.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 04.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 05.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 06.png'
  ];

  updateStep() {
    if (this.isWorldPaused()) return;

    if (!this.shouldAdvanceTimedStep('animationElapsed', this.animationIntervalMs)) return;

    this.showAnimationFrame(this.IMAGES_COINS);
  }
}