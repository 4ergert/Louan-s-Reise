/**
 * @typedef {object} CollidableObject
 * @property {function(): {x: number, y: number, width: number, height: number, offsetY?: number}} getCollisionArea
 */

/**
 * @typedef {CollidableObject & {vcY: number, y: number}} LandingMovableObject
 */

/**
 * Checks whether a movable object is landing on top of a platform.
 * @param {LandingMovableObject} movableObject - The object that may be landing.
 * @param {CollidableObject} platform - The platform to check against.
 * @returns {boolean} True when the object is falling onto the platform surface.
 */
export function isLandingOn(movableObject, platform) {
  let ownCollisionArea = movableObject.getCollisionArea();
  let platformArea = platform.getCollisionArea();
  let feet = ownCollisionArea.y + ownCollisionArea.height;

  return (
    movableObject.vcY <= 0 &&
    ownCollisionArea.x + ownCollisionArea.width > platformArea.x &&
    ownCollisionArea.x < platformArea.x + platformArea.width &&
    ownCollisionArea.y < platformArea.y &&
    feet >= platformArea.y &&
    feet <= platformArea.y + 20
  );
}

/**
 * Snaps a movable object onto the top of a platform and clears its vertical speed.
 * @param {LandingMovableObject} movableObject - The object that is landing.
 * @param {CollidableObject} platform - The platform to land on.
 * @returns {void}
 */
export function landOn(movableObject, platform) {
  let ownCollisionArea = movableObject.getCollisionArea();
  let platformArea = platform.getCollisionArea();

  movableObject.y = platformArea.y - ownCollisionArea.height - ownCollisionArea.offsetY;
  movableObject.vcY = 0;
}

/**
 * Checks whether the character overlaps another collidable object.
 * @param {CollidableObject} character - The character hitbox source.
 * @param {CollidableObject} object - The other object to test.
 * @returns {boolean} True when both collision areas overlap.
 */
export function isCollidingWithCharacter(character, object) {
  let characterArea = character.getCollisionArea();
  let objectArea = object.getCollisionArea();

  return (
    characterArea.x + characterArea.width > objectArea.x &&
    characterArea.x < objectArea.x + objectArea.width &&
    characterArea.y + characterArea.height > objectArea.y &&
    characterArea.y < objectArea.y + objectArea.height
  );
}

/**
 * Checks whether the current object overlaps another collidable object.
 * @this {CollidableObject}
 * @param {CollidableObject} otherObject - The other object to test.
 * @returns {boolean} True when both collision areas overlap.
 */
export function isColliding(otherObject) {
  let ownCollisionArea = this.getCollisionArea();
  let otherCollisionArea = otherObject.getCollisionArea();

  return (
    ownCollisionArea.x + ownCollisionArea.width > otherCollisionArea.x &&
    ownCollisionArea.x < otherCollisionArea.x + otherCollisionArea.width &&
    ownCollisionArea.y + ownCollisionArea.height > otherCollisionArea.y &&
    ownCollisionArea.y < otherCollisionArea.y + otherCollisionArea.height
  );
}

export function isCharacterWithinBossSlashRange() {
  if (this.bossLVL1.isDead || this.bossLVL1.isDying) return false;

  let characterArea = this.character.getCollisionArea();
  let bossArea = this.bossLVL1.getCollisionArea();
  let overlapsVertically =
    characterArea.y < bossArea.y + bossArea.height &&
    characterArea.y + characterArea.height > bossArea.y;

  if (!overlapsVertically) return false;

  let characterRightEdge = characterArea.x + characterArea.width;
  let bossRightEdge = bossArea.x + bossArea.width;
  let horizontalGap = Math.max(
    bossArea.x - characterRightEdge,
    characterArea.x - bossRightEdge,
    0
  );

  return horizontalGap <= 100;
}