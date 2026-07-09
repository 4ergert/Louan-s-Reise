import { playBackgroundAudio } from '../audio.js';
import { StartScreen } from '../models/start-screen-class.js';
import { World } from '../models/world/world.class.js';
import { baseCanvasHeight, baseCanvasWidth, introTransitionDuration } from './config.js';
import { getSelectedLevel, getSelectedLevelId, setSelectedLevelId, setSkipStartScreen, shouldSkipStartScreen } from './level-session.js';
import { gameState } from './state.js';
import { shouldPauseForMobilePortrait, syncMobileOrientationPause } from '../mobile.js';
import { syncGameCanvasSize } from './canvas.js';

/**
 * @typedef {object} StartScreenElements
 * @property {HTMLElement | null} body - Document body used for transition classes.
 * @property {HTMLElement | null} startScreenElement - Story text container shown on the start screen.
 * @property {HTMLElement | null} startScreenCanvas - Decorative canvas shown on the start screen.
 * @property {HTMLElement | null} startScreenControls - Button area shown on the start screen.
 * @property {HTMLElement | null} startScreenMeta - Footer/meta section shown on the start screen.
 * @property {HTMLElement | null} gameCanvasShell - Wrapper that contains the in-game canvas.
 */

/**
 * @typedef {object} GameRevealAnimationState
 * @property {HTMLElement | null} body - Document body used for transition classes.
 * @property {HTMLElement | null} overlay - Fullscreen transition overlay element.
 * @property {HTMLElement | null} gameCanvasShell - Wrapper that contains the in-game canvas.
 * @property {number} startedAt - Timestamp when the animation started.
 * @property {number} duration - Total animation duration in milliseconds.
 */

/**
 * Applies the initial body classes for sessions that should boot directly into gameplay.
 *
 * @returns {void}
 */
export function applyInitialBodyState() {
  if (!shouldBootIntoGame()) return;

  document.body?.classList.remove('intro-mode', 'intro-transition');
  document.body?.classList.add('game-active', 'skip-start-screen');
}

/**
 * Restores the saved level immediately when the current session indicates that the intro should be skipped.
 *
 * @returns {void}
 */
export function startSavedLevelIfNeeded() {
  if (!shouldBootIntoGame()) return;

  setSkipStartScreen(false);
  document.body?.classList.remove('intro-mode', 'intro-transition');
  document.body?.classList.add('game-active');
  document.body?.classList.add('skip-start-screen');
  gameState.isIntroVisible = false;
  showGameCanvas();
  fadeIntoGame();
}

function shouldBootIntoGame() {
  return shouldSkipStartScreen() || getSelectedLevelId() !== 'lvl_1';
}

/**
 * Leaves the intro prompt and opens the animated start screen.
 *
 * @returns {void}
 */
export function showStartScreen() {
  if (!gameState.isIntroVisible) return;

  const body = document.body;

  gameState.isIntroVisible = false;
  body?.classList.add('intro-transition');

  window.setTimeout(() => finishIntroTransition(body), introTransitionDuration);
}

/**
 * Restarts the current game by persisting the skip-start-screen flag and reloading the page.
 *
 * @returns {void}
 */
export function restartGame() {
  setSkipStartScreen(true);
  window.location.reload();
}

/**
 * Resets the session back to the default start screen and reloads the page.
 *
 * @returns {void}
 */
export function resetToStartScreen() {
  setSelectedLevelId('lvl_1');
  setSkipStartScreen(false);
  window.location.reload();
}

/**
 * Starts a specific level by persisting its id and reloading the page.
 *
 * @param {string} levelId - The level id that should be started next.
 * @returns {void}
 */
export function startLevel(levelId) {
  setSelectedLevelId(levelId);
  setSkipStartScreen(true);
  window.location.reload();
}

/**
 * Switches the visible UI from the start screen to the in-game canvas shell.
 *
 * @returns {void}
 */
export function showGameCanvas() {
  if (!gameState.isStartScreenVisible) return;

  const startScreenElements = getStartScreenElements();

  gameState.startScreen?.stop();
  startScreenElements.body?.classList.add('game-active', 'game-transitioning');
  hideStartScreenElements(startScreenElements);
  showGameCanvasShell(startScreenElements.gameCanvasShell);
  gameState.isStartScreenVisible = false;
}

/**
 * Fades from the start screen into active gameplay and starts the background audio afterward.
 *
 * @returns {void}
 */
export function fadeIntoGame() {
  const body = document.body;
  const overlay = document.getElementById('transitionOverlay');
  const gameCanvasShell = document.getElementById('gameCanvasShell');
  const startedAt = performance.now();
  const duration = 700;

  initWorld();

  requestAnimationFrame((timestamp) => {
    revealGame(timestamp, {
      body,
      overlay,
      gameCanvasShell,
      startedAt,
      duration,
    });
  });
}

/**
 * Starts the transition from the start screen into gameplay.
 *
 * @returns {void}
 */
export function startGameTransition() {
  if (!canStartGameTransition()) return;

  gameState.isStartTransitionRunning = true;
  beginStartScreenTransition(runGameTransition);
  fadeTransitionOverlay(document.getElementById('transitionOverlay'), performance.now(), 900);
}

/**
 * Finishes the intro transition and boots the animated start screen when needed.
 *
 * @param {HTMLElement | null} body - Document body used for intro transition classes.
 * @returns {void}
 */
function finishIntroTransition(body) {
  const startScreenCanvas = document.getElementById('startScreenCanvas');

  body?.classList.remove('intro-mode', 'intro-transition');

  if (startScreenCanvas && !gameState.startScreen) {
    gameState.startScreen = new StartScreen(startScreenCanvas);
  }

  gameState.startScreen?.start();
}

/**
 * Indicates whether the game transition may currently start.
 *
 * @returns {boolean} True when the start screen is visible and no transition is already running.
 */
function canStartGameTransition() {
  return gameState.isStartScreenVisible && !gameState.isStartTransitionRunning;
}

/**
 * Runs the actual switch from the start screen into the gameplay canvas.
 *
 * @returns {void}
 */
function runGameTransition() {
  if (!gameState.isStartScreenVisible) return;

  showGameCanvas();
  fadeIntoGame();
}

/**
 * Either triggers the start-screen transition animation or runs the completion immediately.
 *
 * @param {() => void} completeTransition - Callback that finishes the switch into gameplay.
 * @returns {void}
 */
function beginStartScreenTransition(completeTransition) {
  if (!gameState.startScreen?.isReady) {
    completeTransition();
    return;
  }

  gameState.startScreen.beginTransition(completeTransition);
}

/**
 * Advances the reveal animation that fades gameplay into view.
 *
 * @param {number} timestamp - Current animation frame timestamp.
 * @param {GameRevealAnimationState} animationState - Shared state for the reveal animation.
 * @returns {void}
 */
function revealGame(timestamp, animationState) {
  const { body, overlay, gameCanvasShell, startedAt, duration } = animationState;
  const progress = getAnimationProgress(timestamp, startedAt, duration);
  const easedProgress = easeOutQuadratic(progress);

  renderGameRevealFrame(gameCanvasShell, overlay, easedProgress);

  if (progress < 1) {
    requestAnimationFrame((nextTimestamp) => revealGame(nextTimestamp, animationState));
    return;
  }

  finishGameReveal(body, gameCanvasShell, overlay);
}

/**
 * Fades the full-screen transition overlay from opaque to transparent.
 *
 * @param {HTMLElement | null} overlay - Fullscreen transition overlay element.
 * @param {number} startedAt - Timestamp when the animation started.
 * @param {number} duration - Total animation duration in milliseconds.
 * @returns {void}
 */
function fadeTransitionOverlay(overlay, startedAt, duration) {
  const fadeOverlay = (timestamp) => {
    const progress = getAnimationProgress(timestamp, startedAt, duration);

    overlay?.style.setProperty('opacity', `${progress}`);

    if (progress < 1) requestAnimationFrame(fadeOverlay);
  };

  requestAnimationFrame(fadeOverlay);
}

/**
 * Converts the current animation frame timestamp into a normalized progress value.
 *
 * @param {number} timestamp - Current animation frame timestamp.
 * @param {number} startedAt - Timestamp when the animation started.
 * @param {number} duration - Total animation duration in milliseconds.
 * @returns {number} A progress value between `0` and `1`.
 */
function getAnimationProgress(timestamp, startedAt, duration) {
  return Math.min((timestamp - startedAt) / duration, 1);
}

/**
 * Applies a quadratic ease-out curve to an animation progress value.
 *
 * @param {number} progress - Linear animation progress between `0` and `1`.
 * @returns {number} Eased animation progress.
 */
function easeOutQuadratic(progress) {
  return 1 - Math.pow(1 - progress, 2);
}

/**
 * Renders a single frame of the gameplay reveal animation.
 *
 * @param {HTMLElement | null} gameCanvasShell - Wrapper that contains the in-game canvas.
 * @param {HTMLElement | null} overlay - Fullscreen transition overlay element.
 * @param {number} easedProgress - Eased animation progress between `0` and `1`.
 * @returns {void}
 */
function renderGameRevealFrame(gameCanvasShell, overlay, easedProgress) {
  gameCanvasShell?.style.setProperty('opacity', `${easedProgress}`);
  gameState.canvas?.style.setProperty('width', `${baseCanvasWidth * easedProgress}px`);
  gameState.canvas?.style.setProperty('height', `${baseCanvasHeight * easedProgress}px`);
  overlay?.style.setProperty('opacity', `${1 - easedProgress}`);
}

/**
 * Finalizes the gameplay reveal and restores normal runtime sizing/visibility state.
 *
 * @param {HTMLElement | null} body - Document body used for transition classes.
 * @param {HTMLElement | null} gameCanvasShell - Wrapper that contains the in-game canvas.
 * @param {HTMLElement | null} overlay - Fullscreen transition overlay element.
 * @returns {void}
 */
function finishGameReveal(body, gameCanvasShell, overlay) {
  overlay?.style.setProperty('opacity', '0');
  gameCanvasShell?.style.setProperty('opacity', '1');
  gameState.isStartTransitionRunning = false;
  syncGameCanvasSize();
  body?.classList.remove('game-transitioning');
  if (shouldPauseForMobilePortrait()) return;

  playBackgroundAudio(gameState.gameBackgroundAudio);
}

/**
 * Initializes the world once the gameplay canvas is ready.
 *
 * @returns {void}
 */
function initWorld() {
  if (!gameState.canvas || gameState.world) return;

  gameState.world = new World(
    gameState.canvas,
    gameState.keyboard,
    gameState.gameBackgroundAudio,
    getSelectedLevel()
  );
  syncMobileOrientationPause();
}

/**
 * Collects the start-screen and gameplay shell elements used during UI transitions.
 *
 * @returns {StartScreenElements} The relevant transition DOM elements.
 */
function getStartScreenElements() {
  return {
    body: document.body,
    startScreenElement: document.getElementById('startScreen'),
    startScreenCanvas: document.getElementById('startScreenCanvas'),
    startScreenControls: document.getElementById('startScreenControls'),
    startScreenMeta: document.getElementById('startScreenMeta'),
    gameCanvasShell: document.getElementById('gameCanvasShell'),
  };
}

/**
 * Hides all visible start-screen sections before gameplay is shown.
 *
 * @param {StartScreenElements} startScreenElements - DOM elements that belong to the start screen.
 * @returns {void}
 */
function hideStartScreenElements(startScreenElements) {
  startScreenElements.startScreenElement?.style.setProperty('display', 'none');
  startScreenElements.startScreenCanvas?.style.setProperty('display', 'none');
  startScreenElements.startScreenControls?.style.setProperty('display', 'none');
  startScreenElements.startScreenMeta?.style.setProperty('display', 'none');
}

/**
 * Makes the gameplay canvas shell visible and resets the canvas display size for the intro animation.
 *
 * @param {HTMLElement | null} gameCanvasShell - Wrapper that contains the in-game canvas.
 * @returns {void}
 */
function showGameCanvasShell(gameCanvasShell) {
  gameCanvasShell?.style.setProperty('display', 'block');
  gameCanvasShell?.style.setProperty('opacity', '0');
  gameState.canvas?.style.setProperty('width', '0px');
  gameState.canvas?.style.setProperty('height', '0px');
}