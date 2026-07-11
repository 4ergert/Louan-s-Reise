import { createDialogController } from './dialog.js';
import { getSelectedLevelId } from './game/level-session.js';
import { gameMenuDialogIds } from './game/config.js';
import { initGameCanvasResizeHandling, isGameCanvasVisible, syncGameCanvasSize, toggleGameCanvasFullscreen } from './game/canvas.js';
import { initKeyboardEvents } from './game/keyboard-events.js';
import { initMusicToggle } from './game/music-toggle.js';
import { gameState } from './game/state.js';
import { initMobileOrientationPause } from './mobile.js';
import { applyInitialBodyState, finalizeInitialLoadingState, resetToStartScreen, restartGame, showStartScreen, startGameTransition, startLevel, startSavedLevelIfNeeded } from './game/start-flow.js';
import { renderAboutDialog, renderCreditsDialog, renderDatenschutzDialog, renderGameMenuDialog, renderImpressumDialog, renderInstructionsDialog, renderSettingsDialog, renderStartScreen, renderStartScreenControls, renderStartScreenMeta } from './templates/dom-renderer.js';

/**
 * Shared dialog controller for the start screen and in-game menu flow.
 *
 * @type {ReturnType<typeof createDialogController>}
 */
const dialogController = createDialogController({
  gameMenuDialogIds,
  getWorld: () => gameState.world,
  isGameCanvasVisible,
  restartGame,
  resetToStartScreen,
  startLevel,
});

applyInitialBodyState();

/**
 * Bootstraps the game once the page has finished loading.
 *
 * Initializes the canvas, dialog behavior, music controls, resize handling,
 * and restores a previously selected level when needed.
 *
 * @returns {void}
 */
function init() {
  renderStartScreen();
  renderStartScreenControls();
  renderStartScreenMeta();
  renderGameMenuDialog();
	renderAboutDialog();
	renderInstructionsDialog();
  renderSettingsDialog();
  renderCreditsDialog();
  renderDatenschutzDialog();
  renderImpressumDialog();
  gameState.canvas = document.getElementById('gameCanvas');
  initGameOverRetryButton();
  initVictoryActionButton();
  syncGameCanvasSize();
  dialogController.initDialogBackdropClose();
  dialogController.initGameMenu();
  dialogController.initStartScreenDialogs();
  initMusicToggle();
  initGameCanvasResizeHandling();
  initMobileOrientationPause();
  startSavedLevelIfNeeded();
  finalizeInitialLoadingState();
}

/**
 * Wires the game-over retry button to the existing restart flow.
 *
 * @returns {void}
 */
function initGameOverRetryButton() {
  const gameOverActions = document.getElementById('gameOverActions');
  const retryButton = document.getElementById('gameOverRetryButton');
  const startScreenButton = document.getElementById('gameOverStartScreenButton');

  if (!(gameOverActions instanceof HTMLDivElement)) return;
  if (!(retryButton instanceof HTMLButtonElement)) return;
  if (!(startScreenButton instanceof HTMLButtonElement)) return;

  gameOverActions.hidden = true;
  retryButton.addEventListener('click', () => restartGame());
  startScreenButton.addEventListener('click', () => resetToStartScreen());
}

/**
 * Wires the victory button to the correct post-win flow for the active level.
 *
 * @returns {void}
 */
function initVictoryActionButton() {
  const victoryActions = document.getElementById('victoryActions');
  const victoryButton = document.getElementById('victoryFindLiamButton');

  if (!(victoryActions instanceof HTMLDivElement)) return;
  if (!(victoryButton instanceof HTMLButtonElement)) return;

  victoryActions.hidden = true;
  victoryButton.addEventListener('click', () => {
    if (getSelectedLevelId() === 'lvl_2') {
      resetToStartScreen();
      return;
    }

    startLevel('lvl_2');
  });
}

initKeyboardEvents({
  dialogController,
  toggleGameCanvasFullscreen,
  restartGame,
  startLevel,
  resetToStartScreen,
  showStartScreen,
  startGameTransition,
});

window.addEventListener('load', init);