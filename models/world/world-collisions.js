import { die, startKnockback } from '../character/char-animation-actions.js';

export const worldCollisionMethods = {
  updateCollisions() {
    if (this.isPaused) return;

    this.updateEndingEscort();
    const standableObjects = this.getStandableObjects();

    this.updatePlatformLandings(standableObjects);
    this.updateWorldInteractions();

    if (this.character.isDying || this.character.isDead) return;

    this.updateCombatInteractions();
  },

  updatePlatformLandings(standableObjects) {
    this.landOnNearbyPlatforms(this.character, standableObjects);
    this.landOnNearbyPlatforms(this.alia, standableObjects, (alia) => {
      alia.hasLanded = true;
    });

    this.lvl.enemies.forEach((enemy) => {
      if (enemy.isBoss || enemy.isDying || enemy.isDead) return;

      this.landOnNearbyPlatforms(enemy, standableObjects);
    });

    this.lvl.environmentObjects.forEach((object) => {
      if (!object.affectedByPlatforms) return;

      this.landOnNearbyPlatforms(object, standableObjects, (affectedObject) => {
        affectedObject.speedX = 0;
        affectedObject.isCollectible = true;
      });
    });
  },

  updateCombatInteractions() {
    this.handleThrowInput();
    this.updateThrownBones();
    this.updateBossThrownSwords();
    this.updateBossAttackState();

    if (this.resolveStompedEnemy()) return;

    this.resolveEnemyContactHits();
  },

  resolveStompedEnemy() {
    let stompedEnemy = this.lvl.enemies.find((enemy) =>
      !enemy.isBoss &&
      !enemy.isDying && !enemy.isDead &&
      this.character.isColliding(enemy) && this.isStompingEnemy(enemy)
    );

    if (!stompedEnemy) return false;

    this.bounceOffEnemy(stompedEnemy);
    this.handleEnemyDefeat(stompedEnemy);
    return true;
  },

  resolveEnemyContactHits() {
    this.lvl.enemies.forEach((enemy) => {
      if (enemy.isDying || enemy.isDead) return;
      if (enemy.isBoss) return;

      if (this.character.isColliding(enemy) && !this.character.isHurt()) {
        startKnockback(this.character, enemy.x + enemy.width / 2);
        this.character.hit();
      }
    });
  },

  getCharacterFallDeathY() {
    return this.canvas.height;
  },

  isCharacterInDeathFallZone() {
    let fallDeathStartX = this.lvl.worldSettings?.fallDeathStartX;

    return typeof fallDeathStartX === 'number' && this.character.x >= fallDeathStartX;
  },

  handleCharacterFallDeath() {
    if (this.character.isDead) return;
    if (!this.character.shouldKeepFallingIntoAbyss()) return;
    if (this.character.y < this.getCharacterFallDeathY()) return;

    die(this.character);
    this.character.isDying = false;
    this.character.isDead = true;
    this.character.vcY = -6;
  },

  handleEnemyFallDeath() {
    this.lvl.enemies.forEach((enemy) => {
      if (enemy.isBoss || enemy.isDying || enemy.isDead) return;
      if (typeof enemy.shouldKeepFallingIntoAbyss !== 'function') return;
      if (!enemy.shouldKeepFallingIntoAbyss()) return;
      if (enemy.y < this.getCharacterFallDeathY()) return;

      let dyingDuration = enemy.die();

      setTimeout(() => {
        this.removeEnemy(enemy);
      }, dyingDuration);
    });
  },

  getStandableObjects() {
    return this.standableObjectsCache;
  },

  refreshStandableObjectsCache() {
    this.standableObjectsCache = [
      ...(this.lvl.platformObjects ?? []),
      ...(this.lvl.solidObjects ?? []),
    ];
  },

  getNearbyStandableObjects(target, standableObjects, margin = 120) {
    if (!target) return [];

    let collisionArea = target.getCollisionArea?.() ?? target;
    let minX = collisionArea.x - margin;
    let maxX = collisionArea.x + collisionArea.width + margin;

    return standableObjects.filter((platform) => {
      let platformArea = platform.getCollisionArea();

      return platformArea.x + platformArea.width >= minX && platformArea.x <= maxX;
    });
  },

  landOnNearbyPlatforms(target, standableObjects, onLand = null) {
    if (!target) return;
    if (typeof target.isLandingOn !== 'function' || typeof target.landOn !== 'function') return;

    this.getNearbyStandableObjects(target, standableObjects).forEach((platform) => {
      if (!target.isLandingOn(platform)) return;

      target.landOn(platform);
      onLand?.(target, platform);
    });
  },

  blockCharacterBySolidObjects() {
    (this.lvl.solidObjects ?? []).forEach((solidObject) => {
      if (!this.character.isColliding(solidObject)) return;
      if (this.character.isLandingOn(solidObject)) return;
      if (this.shouldIgnoreSolidCollisionFromBelow(solidObject)) return;

      this.resolveCharacterSolidCollision(solidObject);
    });
  },

  resolveCharacterSolidCollision(solidObject) {
    let characterArea = this.character.getCollisionArea();
    let solidArea = solidObject.getCollisionArea();
    let overlaps = this.getCharacterSolidOverlaps(characterArea, solidArea);

    if (Math.min(overlaps.top, overlaps.bottom) < Math.min(overlaps.left, overlaps.right)) {
      this.resolveCharacterVerticalSolidCollision(solidArea, characterArea, overlaps);
      return;
    }

    this.resolveCharacterHorizontalSolidCollision(solidArea, characterArea, overlaps);
  },

  getCharacterSolidOverlaps(characterArea, solidArea) {
    return {
      left: characterArea.x + characterArea.width - solidArea.x,
      right: solidArea.x + solidArea.width - characterArea.x,
      top: characterArea.y + characterArea.height - solidArea.y,
      bottom: solidArea.y + solidArea.height - characterArea.y,
    };
  },

  resolveCharacterVerticalSolidCollision(solidArea, characterArea, overlaps) {
    let characterOffsetY = characterArea.y - this.character.y;

    if (overlaps.top < overlaps.bottom) {
      this.character.y = solidArea.y - characterArea.height - characterOffsetY;
      this.character.vcY = 0;
      return;
    }

    this.character.y = solidArea.y + solidArea.height - characterOffsetY;
    if (this.character.vcY > 0) this.character.vcY = 0;
  },

  resolveCharacterHorizontalSolidCollision(solidArea, characterArea, overlaps) {
    let characterOffsetX = characterArea.x - this.character.x;

    if (overlaps.left < overlaps.right) {
      this.character.x = solidArea.x - characterArea.width - characterOffsetX;
      return;
    }

    this.character.x = solidArea.x + solidArea.width - characterOffsetX;
  },

  shouldIgnoreSolidCollisionFromBelow(solidObject) {
    if (!solidObject.ignoreCollisionFromBelow) return false;

    let characterArea = this.character.getCollisionArea();
    let solidArea = solidObject.getCollisionArea();
    let characterCenterY = characterArea.y + characterArea.height / 2;
    let solidCenterY = solidArea.y + solidArea.height / 2;

    return characterCenterY >= solidCenterY;
  },

  isStompingEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();
    let characterFeet = characterArea.y + characterArea.height;

    return this.character.vcY < 0 && characterFeet <= enemyArea.y + 25;
  },

  bounceOffEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();

    this.character.y = enemyArea.y - characterArea.height - characterArea.offsetY;
    this.character.vcY = 5;
  },
};
