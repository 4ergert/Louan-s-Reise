import { playRandomVariantSound, playSoundEffect } from '../../audio.js';
import { startKnockback } from '../character/char-animation-actions.js';
import { Alia } from '../Alia/alia.class.js';
import { Liam } from '../Liam/liam.class.js';
import { SkeletonWarrior1 } from '../enemies/skeleton_warrior_1.class.js';
import { SkeletonWarrior2 } from '../enemies/skeleton_warrior_2.class.js';
import { BossSlashFxObject } from '../objects/boss-slash-fx-object.class.js';
import { BossSwordObject } from '../objects/boss-sword-object.class.js';

/**
 * Boss encounter, combat, and defeat-related world events.
 */
export const worldBossEventMethods = {
  /**
   * Spawns a skeleton warrior from the boss position.
   *
   * @returns {void}
   */
  spawnSkeletonWarriorFromBoss() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const skeletonWarrior = new SkeletonWarrior1();
    const spawnDirection = this.character.x < this.bossLVL1.x ? -1 : 1;
    const spawnX = this.bossLVL1.x + (spawnDirection < 0 ? 70 : 100);
    const spawnY = this.bossLVL1.y + 180;

    this.assignWorld(skeletonWarrior);
    skeletonWarrior.launchFromBoss(spawnDirection, spawnX, spawnY);
    this.lvl.enemies.push(skeletonWarrior);
  },

  /**
   * Spawns the boss sword boomerang aimed toward the character.
   *
   * @returns {void}
   */
  spawnBossSwordBoomerang() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const throwDirection = this.character.x < this.bossLVL1.x ? -1 : 1;
    const swordWidth = 240;
    const swordHandCenterX = this.bossLVL1.x + (throwDirection < 0 ? 120 : 380);
    const swordX = swordHandCenterX - swordWidth / 2;
    const swordY = this.bossLVL1.y + 190;
    const sword = new BossSwordObject(swordX, swordY, throwDirection);

    this.assignWorld(sword);
    this.bossThrownSwords.push(sword);
  },

  /**
   * Spawns a ground-traveling slash effect aimed toward the character.
   *
   * @returns {void}
   */
  spawnBossSlashFx() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const direction = this.character.x < this.bossLVL1.x ? -1 : 1;
    const slashX = direction < 0 ? this.bossLVL1.x + 60 : this.bossLVL1.x + this.bossLVL1.width - 200;
    const slashY = 275;
    const slashFx = new BossSlashFxObject(slashX, slashY, direction);

    this.assignWorld(slashFx);
    this.bossThrownSwords.push(slashFx);
  },

  /**
   * Starts the boss intro when the encounter conditions are met.
   *
   * @returns {void}
   */
  updateBossIntro() {
    if (!this.openingIntroCompleted || this.bossIntroTriggered || this.character.isDead) return;
    if (!this.bossLVL1) return;
    if (!this.isBossFullyVisible() || !this.isCharacterNearBoss()) return;

    this.bossIntroTriggered = true;
    this.isPaused = true;
    this.bossIntroStartedAt = Date.now();
    this.resetKeyboard();
    this.startIntroTimeout('boss', () => this.finishBossIntro());
  },

  /**
   * @returns {boolean}
   */
  isBossFullyVisible() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    return bossScreenX >= 0 && bossScreenX + this.bossLVL1.width <= this.canvas.width + 100;
  },

  /**
   * @returns {boolean}
   */
  isCharacterNearBoss() {
    let characterRightEdge = this.character.x + this.character.width;
    return this.bossLVL1.x - characterRightEdge <= 400;
  },

  /**
   * Runs the one-time boss intro completion side effects.
   *
   * @returns {void}
   */
  onBossIntroFinished() {
    this.removeObjectsBeforeBossArena();

    if (this.bossIntroLaughPlayed) return;

    this.bossIntroLaughPlayed = true;
    playSoundEffect(this.evilLaughAudio);
  },

  /**
   * Removes objects positioned before the boss arena gate.
   *
   * @returns {void}
   */
  removeObjectsBeforeBossArena() {
    let bossArenaStartX = this.lvl.worldSettings?.bossArenaStartX;

    if (typeof bossArenaStartX !== 'number') return;

    this.removeObjectsBeforeX(bossArenaStartX, (enemy) => enemy.isBoss);
  },

  /**
   * Removes level objects positioned before the provided x-position.
   *
   * @param {number} minX
   * @param {(enemy: *) => boolean} [keepEnemy=() => false]
   * @returns {void}
   */
  removeObjectsBeforeX(minX, keepEnemy = () => false) {
    if (typeof minX !== 'number') return;

    this.lvl.platformObjects = this.filterObjectsBeforeX(this.lvl.platformObjects, minX);
    this.lvl.solidObjects = this.filterObjectsBeforeX(this.lvl.solidObjects, minX);
    this.lvl.environmentObjects = this.filterObjectsBeforeX(this.lvl.environmentObjects, minX);
    this.lvl.enemies = this.filterObjectsBeforeX(this.lvl.enemies, minX, keepEnemy);
    this.refreshStandableObjectsCache();
  },

  /**
   * Filters objects by minimum x-position while allowing selected objects to remain.
   *
   * @param {Array<*> | null | undefined} objects
   * @param {number} minX
   * @param {(object: *) => boolean} [keepObject=() => false]
   * @returns {Array<*>}
   */
  filterObjectsBeforeX(objects, minX, keepObject = () => false) {
    return (objects ?? []).filter((object) => {
      if (keepObject(object)) return true;
      if (typeof object?.x !== 'number') return true;

      return object.x >= minX;
    });
  },

  /**
   * Updates the boss slashing state based on character range.
   *
   * @returns {void}
   */
  updateBossAttackState() {
    if (!this.bossLVL1) return;

    this.bossLVL1.setSlashingState(this.isCharacterWithinBossSlashRange());
  },

  /**
   * Applies boss slash damage and knockback when the character is hit.
   *
   * @returns {void}
   */
  handleBossSlashHit() {
    if (!this.bossLVL1 || this.bossLVL1.isDead) return;
    if (this.character.isDead) return this.spawnBloodSplatter();
    if (this.character.isHurt()) return;

    startKnockback(this.character, this.bossLVL1.x + this.bossLVL1.width / 2);
    this.character.hit();
    this.spawnBloodSplatter();
  },

  /**
   * Handles an enemy defeat, including sound, death animation, and cleanup.
   *
   * @param {*} enemy
   * @returns {void}
   */
  handleEnemyDefeat(enemy) {
    this.playEnemyDefeatSound(enemy);
    let dyingDuration = enemy.die();

    setTimeout(() => {
      if (!enemy.isBoss) this.spawnThrowableObjectAt(enemy);
      this.removeEnemy(enemy);
    }, dyingDuration);
  },

  /**
   * Plays the appropriate defeat sound for supported enemy types.
   *
   * @param {*} enemy
   * @returns {void}
   */
  playEnemyDefeatSound(enemy) {
    if (!(enemy instanceof SkeletonWarrior1) && !(enemy instanceof SkeletonWarrior2)) return;

    this.lastBoneBreakAudioIndex = playRandomVariantSound(this.boneBreakAudios, this.lastBoneBreakAudioIndex);
  },

  /**
   * Removes an enemy from the level and spawns Alia or Liam if the boss was defeated.
   *
   * @param {*} enemyToRemove
   * @returns {void}
   */
  removeEnemy(enemyToRemove) {
    if (enemyToRemove.isBoss) {
      if (this.lvl.worldSettings?.spawnLiamAfterBoss === true && !this.liam) {
        this.spawnLiamAtBoss(enemyToRemove);
      } else if (!this.alia) {
        this.spawnAliaAtBoss(enemyToRemove);
      }
    }

    this.lvl.enemies = this.lvl.enemies.filter((enemy) => enemy !== enemyToRemove);
  },

  /**
   * Spawns Alia near the defeated boss.
   *
   * @param {{ x: number, y: number, width: number, height: number }} boss
   * @returns {void}
   */
  spawnAliaAtBoss(boss) {
    let shouldSpawnBehindCharacter = this.lvl.worldSettings?.aliaSpawnBehindCharacter === true;
    let aliaX = shouldSpawnBehindCharacter
      ? this.character.x - 120
      : boss.x + boss.width / 2 - 130;
    let aliaY = shouldSpawnBehindCharacter
      ? this.character.y
      : boss.y + boss.height - 260;

    this.alia = new Alia(aliaX, aliaY);
    this.assignWorld(this.alia);
  },

  /**
   * Spawns Liam near the defeated boss.
   *
   * @param {{ x: number, y: number, width: number, height: number }} boss
   * @returns {void}
   */
  spawnLiamAtBoss(boss) {
    let liamX = boss.x + boss.width / 2 - 130;
    let liamY = boss.y + boss.height - 260;

    this.liam = new Liam(liamX, liamY);
    this.assignWorld(this.liam);
  },
};