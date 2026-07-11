import { resumeWorldIfAllowed } from '../../mobile.js';

const INTRO_CONFIG = {
  opening: { duration: 6500, typeSpeed: 45, hasCompletedFlag: true },
  boss: { duration: 5000, typeSpeed: 55, hasCompletedFlag: false },
  alia: { duration: 7000, typeSpeed: 45, hasCompletedFlag: true },
  characterResponse: { duration: 5000, typeSpeed: 45, hasCompletedFlag: false },
};

const ACTIVE_INTRO_TYPES = Object.keys(INTRO_CONFIG);

/**
 * @typedef {'opening' | 'boss' | 'alia' | 'characterResponse'} IntroType
 */

/**
 * Creates the default runtime state for all intro types.
 *
 * @returns {Record<string, boolean | number | null | string[]>}
 */
function createIntroStateDefaults() {
  return Object.entries(INTRO_CONFIG).reduce((defaults, [introType, config]) => {
    defaults[`${introType}IntroTriggered`] = false;
    defaults[`${introType}IntroStartedAt`] = 0;
    defaults[`${introType}IntroTimeout`] = null;
    defaults[`${introType}IntroDuration`] = config.duration;
    defaults[`${introType}IntroTypeSpeed`] = config.typeSpeed;
    defaults[`${introType}IntroLines`] = [];

    if (config.hasCompletedFlag) defaults[`${introType}IntroCompleted`] = false;

    return defaults;
  }, {});
}

export class WorldIntros {
  introSkipLocked = false;

  /**
   * Creates the intro state container.
   */
  constructor() {
    Object.assign(this, createIntroStateDefaults());
  }

  /**
   * Skips or completes the currently active intro when space is pressed.
   *
   * @returns {void}
   */
  handleIntroSkip() {
    if (!this.keyboard.SPACE) {
      this.introSkipLocked = false;
      return;
    }

    if (this.introSkipLocked) return;
    this.introSkipLocked = true;

    const activeIntroType = this.getActiveIntroType();
    if (!activeIntroType) return;

    this.skipIntroStep(this.getIntroLines(activeIntroType), activeIntroType);
  }

  /**
   * Skips to fully visible text or finishes the given intro.
   *
   * @param {string[]} lines
   * @param {IntroType} introType
   * @returns {void}
   */
  skipIntroStep(lines, introType) {
    if (!this.isIntroTextFullyVisible(lines, this.getIntroStartedAt(introType), this.getIntroTypeSpeed(introType))) {
      this.setIntroToFullText(lines, introType);
      return;
    }

    if (introType === 'opening') this.finishOpeningIntro();
    if (introType === 'boss') this.finishBossIntro();
    if (introType === 'alia') this.finishAliaIntro();
    if (introType === 'characterResponse') this.finishCharacterResponseIntro();
  }

  /**
   * Returns the dynamic property name for an intro field.
   *
   * @param {IntroType} introType
   * @param {string} suffix
   * @returns {string}
   */
  getIntroPropertyName(introType, suffix) {
    return `${introType}Intro${suffix}`;
  }

  /**
   * @param {IntroType} introType
   * @returns {string[]}
   */
  getIntroLines(introType) {
    return this[this.getIntroPropertyName(introType, 'Lines')];
  }

  /**
   * @param {IntroType} introType
   * @returns {boolean}
   */
  isIntroActive(introType) {
    return this[`is${introType.charAt(0).toUpperCase()}${introType.slice(1)}IntroActive`]();
  }

  /**
   * Returns the highest-priority active intro type.
   *
   * @returns {IntroType | null}
   */
  getActiveIntroType() {
    return ACTIVE_INTRO_TYPES.find((introType) => this.isIntroActive(introType)) ?? null;
  }

  /**
   * @param {IntroType} introType
   * @returns {number}
   */
  getIntroStartedAt(introType) {
    return this[this.getIntroPropertyName(introType, 'StartedAt')];
  }

  /**
   * @param {IntroType} introType
   * @returns {number}
   */
  getIntroTypeSpeed(introType) {
    return this[this.getIntroPropertyName(introType, 'TypeSpeed')];
  }

  /**
   * Fast-forwards an intro to show its full text immediately.
   *
   * @param {string[]} lines
   * @param {IntroType} introType
   * @returns {void}
   */
  setIntroToFullText(lines, introType) {
    let fullCharCount = lines.join(' ').length;
    let typeSpeed = this.getIntroTypeSpeed(introType);
    let startedAt = Date.now() - fullCharCount * typeSpeed;

    this[this.getIntroPropertyName(introType, 'StartedAt')] = startedAt;
  }

  /**
   * @param {string[]} lines
   * @param {number} startedAt
   * @param {number} typeSpeed
   * @returns {boolean}
   */
  isIntroTextFullyVisible(lines, startedAt, typeSpeed) {
    let elapsedTime = Date.now() - startedAt;
    let visibleChars = Math.floor(elapsedTime / typeSpeed);
    return visibleChars >= lines.join(' ').length;
  }

  /**
   * Finishes the opening intro and resumes gameplay.
   *
   * @returns {void}
   */
  finishOpeningIntro() {
    if (this.openingIntroTimeout) clearTimeout(this.openingIntroTimeout);
    this.openingIntroTimeout = null;
    resumeWorldIfAllowed(this);
    this.openingIntroCompleted = true;
  }

  /**
   * Finishes the boss intro and triggers its completion side effects.
   *
   * @returns {void}
   */
  finishBossIntro() {
    if (this.bossIntroTimeout) clearTimeout(this.bossIntroTimeout);
    this.bossIntroTimeout = null;
    resumeWorldIfAllowed(this);
    this.onBossIntroFinished?.();
  }

  /**
   * Finishes the Alia intro and optionally starts the character response intro.
   *
   * @returns {void}
   */
  finishAliaIntro() {
    if (this.aliaIntroTimeout) clearTimeout(this.aliaIntroTimeout);
    this.aliaIntroTimeout = null;
    this.aliaIntroTriggered = false;

    if (this.characterResponseIntroLines.length) {
      this.startCharacterResponseIntro();
      return;
    }

    resumeWorldIfAllowed(this);
  }

  /**
   * Starts the character response intro after the Alia intro.
   *
   * @returns {void}
   */
  startCharacterResponseIntro() {
    if (this.characterResponseIntroTriggered) return;

    this.characterResponseIntroTriggered = true;
    this.isPaused = true;
    this.characterResponseIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.characterResponseIntroTimeout = setTimeout(() => {
      this.finishCharacterResponseIntro();
    }, this.characterResponseIntroDuration);
  }

  /**
   * Finishes the character response intro and starts the ending escort.
   *
   * @returns {void}
   */
  finishCharacterResponseIntro() {
    if (this.characterResponseIntroTimeout) clearTimeout(this.characterResponseIntroTimeout);
    this.characterResponseIntroTimeout = null;
    this.characterResponseIntroTriggered = false;
    resumeWorldIfAllowed(this);
    this.startEndingEscort?.();
  }

  /**
   * @returns {boolean}
   */
  isBossIntroActive() {
    return this.isPaused && this.bossIntroTriggered && !!this.bossLVL1;
  }

  /**
   * @returns {boolean}
   */
  isOpeningIntroActive() {
    return this.isPaused && this.openingIntroTriggered && !this.openingIntroCompleted;
  }

  /**
   * @returns {boolean}
   */
  isAliaIntroActive() {
    return this.isPaused && this.aliaIntroTriggered;
  }

  /**
   * @returns {boolean}
   */
  isCharacterResponseIntroActive() {
    return this.isPaused && this.characterResponseIntroTriggered;
  }

  /**
   * Resets all keyboard flags to their unpressed state.
   *
   * @returns {void}
   */
  resetKeyboard() {
    Object.keys(this.keyboard).forEach((key) => {
      this.keyboard[key] = false;
    });
  }

  /**
   * Applies world settings from the active level onto the world instance.
   *
   * @returns {void}
   */
  applyLevelWorldSettings() {
    if (!this.lvl || !this.lvl.worldSettings) return;

    Object.assign(this, this.lvl.worldSettings);
  }
}