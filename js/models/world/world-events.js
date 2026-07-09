import { playRandomVariantSound, playSoundEffect, stopBackgroundAudio } from '../../audio.js';
import { isSpawning } from '../character/char-movements.js';
import { startKnockback } from '../character/char-animation-actions.js';
import { Alia } from '../Alia/alia.class.js';
import { SkeletonWarrior1 } from '../enemies/skeleton_warrior_1.class.js';
import { SkeletonWarrior2 } from '../enemies/skeleton_warrior_2.class.js';
import { BossSwordObject } from '../objects/boss-sword-object.class.js';

/**
 * @typedef {'opening' | 'boss' | 'alia' | 'characterResponse'} IntroType
 */

export const worldEventMethods = {
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
   * Starts the opening intro once the character is ready.
   *
   * @returns {void}
   */
  updateOpeningIntro() {
    if (this.finishOpeningIntroWithoutLines()) return;
    if (this.openingIntroTriggered || this.character.isDead || isSpawning(this.character)) return;

    this.openingIntroTriggered = true;
    this.isPaused = true;
    this.openingIntroStartedAt = Date.now();
    this.resetKeyboard();
    this.startIntroTimeout('opening', () => this.finishOpeningIntro());
  },

  /**
   * Completes the opening intro immediately when no intro lines exist.
   *
   * @returns {boolean}
   */
  finishOpeningIntroWithoutLines() {
    if (this.openingIntroLines.length) return false;

    this.openingIntroCompleted = true;
    return true;
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
   * Starts and stores the timeout for a specific intro.
   *
   * @param {IntroType} introType
   * @param {() => void} onTimeout
   * @returns {void}
   */
  startIntroTimeout(introType, onTimeout) {
    this[`${introType}IntroTimeout`] = setTimeout(() => {
      onTimeout();
    }, this[`${introType}IntroDuration`]);
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
   * Starts the post-boss ending escort sequence.
   *
   * @returns {void}
   */
  startEndingEscort() {
    if (!this.alia || this.endingEscortActive) return;

    this.endingEscortActive = true;
    this.endingEscortCameraX = this.camera_x;
    this.resetKeyboard();
  },

  /**
   * Advances the ending escort and shows victory once both characters leave the screen.
   *
   * @returns {void}
   */
  updateEndingEscort() {
    if (!this.endingEscortActive || !this.alia) return;

    this.camera_x = this.endingEscortCameraX;
    this.character.imgDirectionChange = false;

    let characterScreenX = this.character.x + this.camera_x;
    let aliaScreenX = this.alia.x + this.camera_x;

    if (characterScreenX <= this.canvas.width + 80 || aliaScreenX <= this.canvas.width + 80) return;

    this.endingEscortActive = false;
    this.isPaused = true;
    this.victoryOverlayVisible = true;
    this.victoryOverlayStartedAt = Date.now();
    this.resetKeyboard();
  },

  /**
   * Plays the game-over audio once and stops any background music.
   *
   * @returns {void}
   */
  playGameOverAudio() {
    if (this.gameOverAudioPlayed) return;

    this.gameOverAudioPlayed = true;
    stopBackgroundAudio(this.backgroundMusicAudio);
    stopBackgroundAudio(this.bossMusicAudio);
    playSoundEffect(this.gameOverAudio);
  },

  /**
   * @returns {boolean}
   */
  isGameOverRetryReady() {
    return this.gameOverStartedAt > 0 && Date.now() - this.gameOverStartedAt >= this.gameOverRetryDelay;
  },

  /**
   * @returns {boolean}
   */
  isVictoryPromptReady() {
    return this.victoryOverlayStartedAt > 0 && Date.now() - this.victoryOverlayStartedAt >= this.victoryPromptDelay;
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

    this.lvl.platformObjects = this.filterObjectsBeforeX(this.lvl.platformObjects, bossArenaStartX);
    this.lvl.solidObjects = this.filterObjectsBeforeX(this.lvl.solidObjects, bossArenaStartX);
    this.lvl.environmentObjects = this.filterObjectsBeforeX(this.lvl.environmentObjects, bossArenaStartX);
    this.lvl.enemies = this.filterObjectsBeforeX(this.lvl.enemies, bossArenaStartX, (enemy) => enemy.isBoss);
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
    if (!this.isCharacterWithinBossSlashRange()) return;

    if (this.character.isDead) {
      this.spawnBloodSplatter();
      return;
    }

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
   * Removes an enemy from the level and spawns Alia if the boss was defeated.
   *
   * @param {*} enemyToRemove
   * @returns {void}
   */
  removeEnemy(enemyToRemove) {
    if (enemyToRemove.isBoss && !this.alia) {
      this.spawnAliaAtBoss(enemyToRemove);
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
    let aliaX = boss.x + boss.width / 2 - 130;
    let aliaY = boss.y + boss.height - 260;

    this.alia = new Alia(aliaX, aliaY);
    this.assignWorld(this.alia);
  },

  /**
   * Starts the Alia intro sequence.
   *
   * @returns {void}
   */
  startAliaIntro() {
    if (!this.alia || this.aliaIntroTriggered || this.aliaIntroCompleted) return;

    this.aliaIntroTriggered = true;
    this.aliaIntroCompleted = true;
    this.isPaused = true;
    this.aliaIntroStartedAt = Date.now();
    this.resetKeyboard();
    this.startIntroTimeout('alia', () => this.finishAliaIntro());
  },
};
