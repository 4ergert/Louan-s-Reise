import { EnvironmentObject } from './environment-objects.class.js';

const MUSHROOM_IMAGE = './assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Mushroom .png';
const DEFAULT_WIDTH = 60;
const DEFAULT_HEIGHT = 60;
const DEFAULT_SPEED_X = 2.2;
const DEFAULT_LAUNCH_SPEED = 4.5;

/**
 * Collectible mushroom reward spawned from unlocked chests.
 */
export class MushroomObject extends EnvironmentObject {
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} [width=DEFAULT_WIDTH]
   * @param {number} [height=DEFAULT_HEIGHT]
   */
  constructor(x, y, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
    super(MUSHROOM_IMAGE, x, y, width, height);
    this.affectedByPlatforms = true;
    this.isChestReward = true;
    this.isCollectible = false;
    this.maxSegmentBonus = 2;
    this.speedX = DEFAULT_SPEED_X;
    this.launchSpeed = DEFAULT_LAUNCH_SPEED;
  }
}