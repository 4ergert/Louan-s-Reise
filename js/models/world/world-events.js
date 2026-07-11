import { playSoundEffect, stopBackgroundAudio } from '../../audio.js';
import { isSpawning } from '../character/char-movements.js';
import { Alia } from '../Alia/alia.class.js';

/**
 * @typedef {'opening' | 'boss' | 'alia' | 'characterResponse'} IntroType
 */

/**
 * Intro, ending, and overlay-related world events.
 */
export const worldEventMethods = {
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

    if (this.canStartEndingLiamChase()) {
      this.startEndingLiamChase();
      return;
    }

    this.finishEndingSequence();
  },

  /**
   * @returns {boolean}
   */
  canStartEndingLiamChase() {
    return Boolean(this.liam && !this.endingLiamChaseActive);
  },

  /**
   * @returns {void}
   */
  startEndingLiamChase() {
    this.endingEscortActive = false;
    this.endingLiamChaseActive = true;
    this.endingLiamChaseStartedAt = Date.now();
  },

  /**
   * @returns {void}
   */
  updateEndingLiamChase() {
    if (!this.endingLiamChaseActive || !this.liam) return;

    this.camera_x = this.endingEscortCameraX;

    let liamScreenX = this.liam.x + this.camera_x;

    if (liamScreenX <= this.canvas.width + 80) return;

    this.endingLiamChaseActive = false;
    this.finishEndingSequence();
  },

  /**
   * @returns {void}
   */
  finishEndingSequence() {
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
   * Spawns Alia at level start when the active level begins with her already accompanying the character.
   *
   * @returns {void}
   */
  spawnInitialAliaIfConfigured() {
    if (this.alia) return;
    if (this.lvl.worldSettings?.startWithAlia !== true) return;

    this.alia = new Alia(this.character.x - 120, this.character.y);
    this.assignWorld(this.alia);
    this.aliaIntroCompleted = true;
  },

  /**
   * Starts the Alia intro sequence.
   *
   * @returns {void}
   */
  startAliaIntro() {
    let isLiamIntro = Boolean(this.liam && this.LiamIntroLines?.length);

    if ((!this.alia && !this.liam) || this.aliaIntroTriggered) return;
    if (isLiamIntro && this.liamIntroCompleted) return;
    if (!isLiamIntro && this.aliaIntroCompleted) return;

    this.aliaIntroTriggered = true;
    const completedIntroKey = isLiamIntro ? 'liamIntroCompleted' : 'aliaIntroCompleted';

    this[completedIntroKey] = true;
    this.isPaused = true;
    this.aliaIntroStartedAt = Date.now();
    this.resetKeyboard();
    this.startIntroTimeout('alia', () => this.finishAliaIntro());
  },
};