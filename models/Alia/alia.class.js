import { MovableObject } from '../objects/movable-object.class.js';
import { ALIA_SPRITES } from './alia-sprites.js';

export class Alia extends MovableObject {
  world;

  IDLE = ALIA_SPRITES.IDLE_ANIMATION;
  WALK = ALIA_SPRITES.WALK_ANIMATION;
  RUN = ALIA_SPRITES.RUN_ANIMATION;

  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.loadImage(ALIA_SPRITES.IDLE_ANIMATION[0]);
    this.loadImages(this.IDLE);
    this.loadImages(this.WALK);
    this.loadImages(this.RUN);

    this.getCollisionArea();
    this.applyGravity();
    this.animate();
  }

  animate() {
    setInterval(() => {
      this.playAnimation(this.IDLE);
    }, 100);
  }

  playAnimation(images) {
    let frameIndex = this.currentImage % images.length;
    let path = images[frameIndex];

    this.img = this.imgCache[path];
    this.currentImage++;
  }
}