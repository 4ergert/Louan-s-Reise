import { gameState } from './state.js';
import { getSelectedLevelId } from './level-session.js';

/**
 * @typedef {object} KeyboardEventActions
 * @property {ReturnType<import('../dialog.js').createDialogController>} dialogController - Dialog API used to block shortcuts while dialogs are open.
 * @property {() => void | Promise<void>} toggleGameCanvasFullscreen - Toggles fullscreen mode for the game canvas.
 * @property {() => void} restartGame - Restarts the current game session.
 * @property {(levelId: string) => void} startLevel - Starts the requested level.
 * @property {() => void} resetToStartScreen - Returns from gameplay to the start screen.
 * @property {() => void} showStartScreen - Transitions from the intro prompt to the start screen.
 * @property {() => void} startGameTransition - Starts the transition from the start screen into gameplay.
 */

// Maps browser key values to the internal keyboard state properties.
const keyboardStateByKey = {
  ArrowLeft: 'LEFT',
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN',
  ' ': 'SPACE',
  Control: 'CTRL',
  a: 'A',
  A: 'A',
  f: 'F',
  F: 'F',
};

/**
 * Registers global keyboard listeners for menu shortcuts, transitions, and gameplay input state.
 *
 * @param {KeyboardEventActions} actions - External actions invoked by keyboard shortcuts.
 * @returns {void}
 */
export function initKeyboardEvents({
  dialogController,
  toggleGameCanvasFullscreen,
  restartGame,
  startLevel,
  resetToStartScreen,
  showStartScreen,
  startGameTransition,
}) {
  window.addEventListener('keydown', (event) => {
    handleKeyDown(event, {
      dialogController,
      toggleGameCanvasFullscreen,
      restartGame,
      startLevel,
      resetToStartScreen,
      showStartScreen,
      startGameTransition,
    });
  });

  window.addEventListener('keyup', handleKeyUp);
  initIntroStartButton(showStartScreen);
  initTouchStartScreenTransition(startGameTransition);
  initMobileTouchControls();
}

/**
 * Registers the mobile intro start button to use the same flow as the keyboard shortcut.
 *
 * @param {() => void} showStartScreen - Transitions from the intro prompt to the start screen.
 * @returns {void}
 */
function initIntroStartButton(showStartScreen) {
  const introStartButton = document.getElementById('introStartButton');

  if (!(introStartButton instanceof HTMLButtonElement)) return;

  introStartButton.addEventListener('click', () => showStartScreen());
}

/**
 * Starts the game when a phone-sized touch device taps the start screen canvas.
 *
 * @param {() => void} startGameTransition - Starts the transition from the start screen into gameplay.
 * @returns {void}
 */
function initTouchStartScreenTransition(startGameTransition) {
  const startScreenCanvas = document.getElementById('startScreenCanvas');

  if (!(startScreenCanvas instanceof HTMLCanvasElement)) return;

  startScreenCanvas.addEventListener('click', () => {
    if (!isMobileTouchDevice()) return;

    startGameTransition();
  });
}

/**
 * Registers touch handlers that map mobile control buttons to keyboard flags.
 *
 * @returns {void}
 */
function initMobileTouchControls() {
  registerMobileTouchButton('mobileLeftButton', 'LEFT');
  registerMobileTouchButton('mobileRightButton', 'RIGHT');
  registerMobileTouchButton('mobileJumpButton', 'UP');
  registerMobileToggleButton('mobileRunningButton', 'A');
  registerMobileTouchButton('mobileThrowButton', 'F');
}

/**
 * Wires one mobile control button to a keyboard state property via touch events.
 *
 * @param {string} buttonId - DOM id of the mobile control button.
 * @param {'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SPACE' | 'CTRL' | 'A' | 'F'} keyboardProperty - Keyboard flag to toggle.
 * @returns {void}
 */
function registerMobileTouchButton(buttonId, keyboardProperty) {
  const button = document.getElementById(buttonId);

  if (!(button instanceof HTMLButtonElement)) return;

  button.addEventListener('touchstart', (event) => {
    event.preventDefault();
    gameState.keyboard[keyboardProperty] = true;
    setMobileButtonActiveState(button, true);
  }, { passive: false });

  button.addEventListener('touchend', () => {
    gameState.keyboard[keyboardProperty] = false;
    setMobileButtonActiveState(button, false);
  });

  button.addEventListener('touchcancel', () => {
    gameState.keyboard[keyboardProperty] = false;
    setMobileButtonActiveState(button, false);
  });
}

/**
 * Wires one mobile control button to toggle a keyboard state property on each touch.
 *
 * @param {string} buttonId - DOM id of the mobile control button.
 * @param {'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SPACE' | 'CTRL' | 'A' | 'F'} keyboardProperty - Keyboard flag to toggle.
 * @returns {void}
 */
function registerMobileToggleButton(buttonId, keyboardProperty) {
  const button = document.getElementById(buttonId);

  if (!(button instanceof HTMLButtonElement)) return;

  button.addEventListener('touchstart', (event) => {
    event.preventDefault();
    gameState.keyboard[keyboardProperty] = !gameState.keyboard[keyboardProperty];
    setMobileButtonActiveState(button, gameState.keyboard[keyboardProperty]);
  }, { passive: false });
}

/**
 * Mirrors a mobile button's pressed state into a data attribute for visual feedback.
 *
 * @param {HTMLButtonElement} button - Mobile control button element.
 * @param {boolean} isActive - Whether the button should appear active.
 * @returns {void}
 */
function setMobileButtonActiveState(button, isActive) {
  button.dataset.active = isActive ? 'true' : 'false';
}

/**
 * Detects whether the current device should use touch-first mobile interactions.
 *
 * @returns {boolean}
 */
function isMobileTouchDevice() {
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(any-pointer: coarse)').matches;
  const hasTouchInput = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  const isSmallViewport = Math.min(window.innerWidth, window.innerHeight) <= 900;

  return isSmallViewport && (hasCoarsePointer || hasTouchInput);
}

/**
 * Handles keydown events by processing shortcuts before updating gameplay input state.
 *
 * @param {KeyboardEvent} event - The browser keyboard event.
 * @param {KeyboardEventActions} actions - External actions invoked by keyboard shortcuts.
 * @returns {void}
 */
function handleKeyDown(event, actions) {
  if (handleGlobalShortcuts(event, actions)) return;
  if (handleGameFlowShortcuts(event, actions)) return;

  setMovementKeyState(event.key, true);
}

/**
 * Handles keyup events by clearing the matching gameplay input state.
 *
 * @param {KeyboardEvent} event - The browser keyboard event.
 * @returns {void}
 */
function handleKeyUp(event) {
  setMovementKeyState(event.key, false);
}

/**
 * Handles shortcuts that are available regardless of the current game flow state.
 *
 * @param {KeyboardEvent} event - The browser keyboard event.
 * @param {KeyboardEventActions} actions - External actions invoked by keyboard shortcuts.
 * @returns {boolean} True when the event was fully handled.
 */
function handleGlobalShortcuts(event, { toggleGameCanvasFullscreen, dialogController }) {
  if (event.key === 'F11') {
    event.preventDefault();
    toggleGameCanvasFullscreen();
    return true;
  }

  return dialogController.isMetaDialogOpen();
}

/**
 * Handles flow-specific shortcuts like intro progression, retry, and level advancement.
 *
 * @param {KeyboardEvent} event - The browser keyboard event.
 * @param {KeyboardEventActions} actions - External actions invoked by keyboard shortcuts.
 * @returns {boolean} True when the event was fully handled.
 */
function handleGameFlowShortcuts(event, { restartGame, startLevel, resetToStartScreen, showStartScreen, startGameTransition }) {
  if (handleGameOverShortcut(restartGame)) return true;

  if (handleVictoryShortcut(startLevel, resetToStartScreen)) return true;

  if (handleIntroShortcut(showStartScreen)) return true;

  if (handleStartScreenShortcut(event, startGameTransition)) return true;

  return false;
}

/**
 * Handles the retry shortcut after a game over once the retry prompt is available.
 *
 * @param {() => void} restartGame - Restarts the current game session.
 * @returns {boolean} True when the shortcut was handled.
 */
function handleGameOverShortcut(restartGame) {
  if (!(gameState.world?.character?.isDead && gameState.world.isGameOverRetryReady?.())) return false;

  restartGame();
  return true;
}

/**
 * Handles the shortcut that advances to the next level after the victory prompt appears.
 *
 * @param {(levelId: string) => void} startLevel - Starts the requested level.
 * @param {() => void} resetToStartScreen - Returns to the start screen.
 * @returns {boolean} True when the shortcut was handled.
 */
function handleVictoryShortcut(startLevel, resetToStartScreen) {
  if (!(gameState.world?.victoryOverlayVisible && gameState.world.isVictoryPromptReady?.())) return false;

  if (getSelectedLevelId() === 'lvl_2') {
    resetToStartScreen();
    return true;
  }

  startLevel('lvl_2');
  return true;
}

/**
 * Handles the shortcut that dismisses the intro prompt and opens the start screen.
 *
 * @param {() => void} showStartScreen - Transitions from the intro prompt to the start screen.
 * @returns {boolean} True when the shortcut was handled.
 */
function handleIntroShortcut(showStartScreen) {
  if (!gameState.isIntroVisible) return false;

  showStartScreen();
  return true;
}

/**
 * Handles the spacebar shortcut that starts the transition from the start screen into gameplay.
 *
 * @param {KeyboardEvent} event - The browser keyboard event.
 * @param {() => void} startGameTransition - Starts the transition into gameplay.
 * @returns {boolean} True when the shortcut was handled.
 */
function handleStartScreenShortcut(event, startGameTransition) {
  if (!(gameState.isStartScreenVisible && event.key === ' ')) return false;

  event.preventDefault();
  gameState.keyboard.SPACE = true;
  startGameTransition();
  return true;
}

/**
 * Maps a browser key value onto the internal keyboard state object.
 *
 * @param {string} key - The `KeyboardEvent.key` value to map.
 * @param {boolean} isPressed - Whether the key should be marked as pressed.
 * @returns {void}
 */
function setMovementKeyState(key, isPressed) {
  const keyboardProperty = keyboardStateByKey[key];

  if (!keyboardProperty) return;

  gameState.keyboard[keyboardProperty] = isPressed;
}