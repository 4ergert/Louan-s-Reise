import { DrawableObject } from '../objects/drawable-objects.class.js';

export class Bone extends DrawableObject {
  x = 0;
  y = 0;
  width = 40;
  height = 40;

  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;
    this.loadImage(this.IMAGES_COINS[0]);
    this.loadImages(this.IMAGES_COINS);
    this.animation();
  }

  IMAGES_COINS = [
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 01.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 02.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 03.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 04.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 05.png',
    './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Coin 06.png'
  ];

  animation() {
    setInterval(() => {
      if (this.world?.isPaused) return;

      let i = this.currentImage % this.IMAGES_COINS.length;
      let path = this.IMAGES_COINS[i];
      this.img = this.imgCache[path];
      this.currentImage++;
    }, 100);
  }
}