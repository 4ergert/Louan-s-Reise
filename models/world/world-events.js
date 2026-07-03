import { playRandomVariantSound, playSoundEffect, stopBackgroundAudio } from '../../js/audio.js';
import { isSpawning } from '../character/char-movements.js';
import { startKnockback } from '../character/char-animation-actions.js';
import { Alia } from '../Alia/alia.class.js';
import { SkeletonWarriorLVL1 } from '../enemies/skeleton_warrior_1.class.js';
import { SkeletonWarrior2 } from '../enemies/skeleton_warrior_2.class.js';
import { BossSwordObject } from '../objects/boss-sword-object.class.js';

export const worldEventMethods = {
  spawnSkeletonWarriorFromBoss() {
    if (!this.bossLVL1 || this.bossLVL1.isDying || this.bossLVL1.isDead) return;

    const skeletonWarrior = new SkeletonWarriorLVL1();
    const spawnDirection = this.character.x < this.bossLVL1.x ? -1 : 1;
    const spawnX = this.bossLVL1.x + (spawnDirection < 0 ? 70 : 100);
    const spawnY = this.bossLVL1.y + 180;

    this.assignWorld(skeletonWarrior);
    skeletonWarrior.launchFromBoss(spawnDirection, spawnX, spawnY);
    this.lvl.enemies.push(skeletonWarrior);
  },

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

  updateOpeningIntro() {
    if (!this.openingIntroLines.length) {
      this.openingIntroCompleted = true;
      return;
    }

    if (this.openingIntroTriggered || this.character.isDead || isSpawning(this.character)) return;

    this.openingIntroTriggered = true;
    this.isPaused = true;
    this.openingIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.openingIntroTimeout = setTimeout(() => {
      this.finishOpeningIntro();
    }, this.openingIntroDuration);
  },

  updateBossIntro() {
    if (!this.openingIntroCompleted || this.bossIntroTriggered || this.character.isDead) return;
    if (!this.bossLVL1) return;
    if (!this.isBossFullyVisible() || !this.isCharacterNearBoss()) return;

    this.bossIntroTriggered = true;
    this.isPaused = true;
    this.bossIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.bossIntroTimeout = setTimeout(() => {
      this.finishBossIntro();
    }, this.bossIntroDuration);
  },

  isBossFullyVisible() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    return bossScreenX >= 0 && bossScreenX + this.bossLVL1.width <= this.canvas.width + 100;
  },

  isCharacterNearBoss() {
    let characterRightEdge = this.character.x + this.character.width;
    return this.bossLVL1.x - characterRightEdge <= 400;
  },

  startEndingEscort() {
    if (!this.alia || this.endingEscortActive) return;

    this.endingEscortActive = true;
    this.endingEscortCameraX = this.camera_x;
    this.resetKeyboard();
  },

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

  playGameOverAudio() {
    if (this.gameOverAudioPlayed) return;

    this.gameOverAudioPlayed = true;
    stopBackgroundAudio(this.backgroundMusicAudio);
    stopBackgroundAudio(this.bossMusicAudio);
    playSoundEffect(this.gameOverAudio);
  },

  isGameOverRetryReady() {
    return this.gameOverStartedAt > 0 && Date.now() - this.gameOverStartedAt >= this.gameOverRetryDelay;
  },

  isVictoryPromptReady() {
    return this.victoryOverlayStartedAt > 0 && Date.now() - this.victoryOverlayStartedAt >= this.victoryPromptDelay;
  },

  onBossIntroFinished() {
    this.removeObjectsBeforeBossArena();

    if (this.bossIntroLaughPlayed) return;

    this.bossIntroLaughPlayed = true;
    playSoundEffect(this.evilLaughAudio);
  },

  removeObjectsBeforeBossArena() {
    let bossArenaStartX = this.lvl.worldSettings?.bossArenaStartX;

    if (typeof bossArenaStartX !== 'number') return;

    this.lvl.platformObjects = this.filterObjectsBeforeX(this.lvl.platformObjects, bossArenaStartX);
    this.lvl.solidObjects = this.filterObjectsBeforeX(this.lvl.solidObjects, bossArenaStartX);
    this.lvl.environmentObjects = this.filterObjectsBeforeX(this.lvl.environmentObjects, bossArenaStartX);
    this.lvl.enemies = this.filterObjectsBeforeX(this.lvl.enemies, bossArenaStartX, (enemy) => enemy.isBoss);
    this.refreshStandableObjectsCache();
  },

  filterObjectsBeforeX(objects, minX, keepObject = () => false) {
    return (objects ?? []).filter((object) => {
      if (keepObject(object)) return true;
      if (typeof object?.x !== 'number') return true;

      return object.x >= minX;
    });
  },

  updateBossAttackState() {
    if (!this.bossLVL1) return;

    this.bossLVL1.setSlashingState(this.isCharacterWithinBossSlashRange());
  },

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

  handleEnemyDefeat(enemy) {
    this.playEnemyDefeatSound(enemy);
    let dyingDuration = enemy.die();

    setTimeout(() => {
      if (!enemy.isBoss) this.spawnThrowableObjectAt(enemy);
      this.removeEnemy(enemy);
    }, dyingDuration);
  },

  playEnemyDefeatSound(enemy) {
    if (!(enemy instanceof SkeletonWarriorLVL1) && !(enemy instanceof SkeletonWarrior2)) return;

    this.lastBoneBreakAudioIndex = playRandomVariantSound(this.boneBreakAudios, this.lastBoneBreakAudioIndex);
  },

  removeEnemy(enemyToRemove) {
    if (enemyToRemove.isBoss && !this.alia) {
      this.spawnAliaAtBoss(enemyToRemove);
    }

    this.lvl.enemies = this.lvl.enemies.filter((enemy) => enemy !== enemyToRemove);
  },

  spawnAliaAtBoss(boss) {
    let aliaX = boss.x + boss.width / 2 - 130;
    let aliaY = boss.y + boss.height - 260;

    this.alia = new Alia(aliaX, aliaY);
    this.assignWorld(this.alia);
  },

  startAliaIntro() {
    if (!this.alia || this.aliaIntroTriggered || this.aliaIntroCompleted) return;

    this.aliaIntroTriggered = true;
    this.aliaIntroCompleted = true;
    this.isPaused = true;
    this.aliaIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.aliaIntroTimeout = setTimeout(() => {
      this.finishAliaIntro();
    }, this.aliaIntroDuration);
  },
};
