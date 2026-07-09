import { resumeWorldIfAllowed } from './mobile.js';

/**
 * @typedef {object} DialogControllerOptions
 * @property {string[]} gameMenuDialogIds
 * @property {() => any} getWorld
 * @property {() => boolean} isGameCanvasVisible
 * @property {() => void} restartGame
 * @property {() => void} resetToStartScreen
 * @property {(levelId: string) => void} startLevel
 */

/**
 * @typedef {object} CloseDialogOptions
 * @property {boolean} [skipPauseSync=false]
 */

/**
 * Creates the dialog controller used for start-screen dialogs and the in-game menu flow.
 *
 * @param {DialogControllerOptions} options - DOM and game-state dependencies for dialog control.
 * @returns {{
 *   initDialogBackdropClose: () => void,
 *   initGameMenu: () => void,
 *   initStartScreenDialogs: () => void,
 *   isMetaDialogOpen: () => boolean,
 * }} The public dialog API consumed by the game bootstrap.
 */
export function createDialogController({ gameMenuDialogIds, getWorld, isGameCanvasVisible, restartGame, resetToStartScreen, startLevel }) {
  let isGameMenuPauseActive = false;

  /**
   * Registers backdrop click handling for all meta dialogs.
   *
   * @returns {void}
   */
  function initDialogBackdropClose() {
    const dialogs = document.querySelectorAll(".metaDialog");

    dialogs.forEach((dialog) => {
      if (!(dialog instanceof HTMLDialogElement)) return;
      registerBackdropClose(dialog);
      registerCloseFocusReset(dialog);
    });
  }

  /**
   * Closes a dialog when the user clicks on its backdrop.
   *
   * @param {HTMLDialogElement} dialog - The dialog that should react to backdrop clicks.
   * @returns {void}
   */
  function registerBackdropClose(dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;

      dialog.close();
      syncGameMenuPauseState();
    });
  }

  /**
   * Clears restored trigger focus for start-screen dialogs so Space does not reopen them.
   *
   * @param {HTMLDialogElement} dialog - The dialog that may restore focus to its opener.
   * @returns {void}
   */
  function registerCloseFocusReset(dialog) {
    dialog.addEventListener("close", () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(resetStartScreenDialogFocus);
      });
    });
  }

  /**
   * Removes focus from the last active trigger while the game canvas is still hidden.
   *
   * @returns {void}
   */
  function resetStartScreenDialogFocus() {
    if (isGameCanvasVisible()) return;

    const startScreen = document.getElementById("startScreen");

    if (startScreen instanceof HTMLElement) {
      startScreen.setAttribute("tabindex", "-1");
      startScreen.focus({ preventScroll: true });
    }

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }

  /**
   * Checks whether any dialog that belongs to the in-game menu stack is currently open.
   *
   * @returns {boolean} True when at least one tracked game-menu dialog is open.
   */
  function isAnyGameMenuDialogOpen() {
    return gameMenuDialogIds.some((dialogId) => {
      const dialog = document.getElementById(dialogId);
      return dialog instanceof HTMLDialogElement && dialog.open;
    });
  }

  /**
   * Synchronizes the game's paused state with the currently open menu dialogs.
   *
   * @returns {void}
   */
  function syncGameMenuPauseState() {
    const world = getWorld();

    if (isAnyGameMenuDialogOpen()) {
      activateGameMenuPause(world);
      return;
    }

    if (!isGameMenuPauseActive) return;

    deactivateGameMenuPause(world);
  }

  /**
   * Marks the menu pause as active and pauses the world once.
   *
   * @param {{isPaused: boolean, resetKeyboard?: () => void}} world - The active world instance.
   * @returns {void}
   */
  function activateGameMenuPause(world) {
    if (!world || world.isPaused) return;

    isGameMenuPauseActive = true;
    world.isPaused = true;
    world.resetKeyboard?.();
  }

  /**
   * Clears the menu pause flag and resumes the world.
   *
   * @param {{isPaused: boolean, resetKeyboard?: () => void}} world - The active world instance.
   * @returns {void}
   */
  function deactivateGameMenuPause(world) {
    if (!world) {
      isGameMenuPauseActive = false;
      return;
    }

    isGameMenuPauseActive = false;
    resumeWorldIfAllowed(world);
  }

  /**
   * Hooks pause synchronization into all dialogs that belong to the in-game menu stack.
   *
   * @returns {void}
   */
  function initGameMenuDialogPause() {
    gameMenuDialogIds.forEach((dialogId) => {
      const dialog = document.getElementById(dialogId);

      if (!(dialog instanceof HTMLDialogElement)) return;

      dialog.addEventListener("close", syncGameMenuPauseState);
      dialog.addEventListener("cancel", () => window.setTimeout(syncGameMenuPauseState, 0));
    });
  }

  /**
   * Opens a dialog by its DOM id.
   *
   * @param {string | null} dialogId - The target dialog id.
   * @returns {void}
   */
  function openDialogById(dialogId) {
    openDialogByIdWithOptions(dialogId);
  }

  /**
   * Opens a dialog and updates its menu return state when needed.
   *
   * @param {string | null} dialogId - The target dialog id.
   * @param {{fromGameMenu?: boolean}} [options={}] - Opening context flags.
   * @returns {void}
   */
  function openDialogByIdWithOptions(dialogId, options = {}) {
    if (!dialogId) return;

    const dialog = document.getElementById(dialogId);

    if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;

    updateDialogMenuReturnState(dialog, Boolean(options.fromGameMenu));
    dialog.showModal();
    syncGameMenuPauseState();
  }

  /**
   * Toggles the optional "back to menu" button inside a dialog.
   *
   * @param {HTMLDialogElement} dialog - The dialog that may contain a return button.
   * @param {boolean} shouldShow - Whether the button should be visible.
   * @returns {void}
   */
  function updateDialogMenuReturnState(dialog, shouldShow) {
    const backToMenuButton = dialog.querySelector(".backToMenuButton");

    if (!(backToMenuButton instanceof HTMLButtonElement)) return;

    backToMenuButton.hidden = !shouldShow;
  }

  /**
   * Closes a dialog and optionally skips pause synchronization for chained dialog flows.
   *
   * @param {string | null} dialogId - The target dialog id.
   * @param {CloseDialogOptions} [options={}] - Close-flow options.
   * @returns {void}
   */
  function closeDialogById(dialogId, options = {}) {
    const dialog = document.getElementById(dialogId);

    if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;

    dialog.close();
    updateDialogMenuReturnState(dialog, false);
    if (options.skipPauseSync) return;

    syncGameMenuPauseState();
  }

  /**
   * Wires the in-game menu button to open the root menu dialog.
   *
   * @returns {void}
   */
  function initGameMenu() {
    const gameMenuButton = document.getElementById("gameMenuButton");
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const startScreenMenuButton = document.getElementById("startScreenMenuButton");

    initGameMenuDialogPause();

    registerGameMenuButton(gameMenuButton);
    registerGameMenuButton(mobileMenuButton);
    registerGameMenuButton(startScreenMenuButton);
  }

  /**
   * Registers a game menu trigger button when present.
   *
   * @param {Element | null} button
   * @returns {void}
   */
  function registerGameMenuButton(button) {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener("click", () => openDialogById("gameMenuDialog"));
  }

  /**
   * Wires all dialog target and return buttons declared in the DOM.
   *
   * @returns {void}
   */
  function initStartScreenDialogs() {
    const dialogButtons = document.querySelectorAll("[data-dialog-target]");
    const returnButtons = document.querySelectorAll("[data-return-dialog-target]");
    const menuActionButtons = document.querySelectorAll("[data-menu-action]");

    dialogButtons.forEach((button) => registerDialogTargetButton(button));
    returnButtons.forEach((button) => registerReturnDialogButton(button));
    menuActionButtons.forEach((button) => registerMenuActionButton(button));
  }

  /**
   * Registers a button that triggers a predefined menu action.
   *
   * @param {Element} button - The potential menu action trigger element.
   * @returns {void}
   */
  function registerMenuActionButton(button) {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener("click", () => handleMenuActionButtonClick(button));
  }

  /**
   * Runs the configured menu action for the clicked button.
   *
   * @param {HTMLButtonElement} button - The clicked menu action button.
   * @returns {void}
   */
  function handleMenuActionButtonClick(button) {
    const action = button.getAttribute("data-menu-action");

    if (action === "restart-game") {
      closeDialogById("gameMenuDialog", { skipPauseSync: true });
      resetToStartScreen();
      return;
    }

    if (action === "start-lvl-1") {
      closeDialogById("gameMenuDialog", { skipPauseSync: true });
      startLevel("lvl_1");
    }
  }

  /**
   * Registers a button that opens a dialog via `data-dialog-target`.
   *
   * @param {Element} button - The potential dialog trigger element.
   * @returns {void}
   */
  function registerDialogTargetButton(button) {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener("click", () => handleDialogTargetButtonClick(button));
  }

  /**
   * Handles opening a target dialog and closing the game menu first when necessary.
   *
   * @param {HTMLButtonElement} button - The clicked trigger button.
   * @returns {void}
   */
  function handleDialogTargetButtonClick(button) {
    const dialogId = button.getAttribute("data-dialog-target");
    const cameFromGameMenu = Boolean(button.closest("#gameMenuDialog"));

    if (cameFromGameMenu) closeDialogById("gameMenuDialog", { skipPauseSync: true });

    openDialogByIdWithOptions(dialogId, { fromGameMenu: cameFromGameMenu });
  }

  /**
   * Registers a button that returns from one dialog into another.
   *
   * @param {Element} button - The potential return button element.
   * @returns {void}
   */
  function registerReturnDialogButton(button) {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener("click", () => handleReturnDialogButtonClick(button));
  }

  /**
   * Closes the current dialog and opens the return target dialog.
   *
   * @param {HTMLButtonElement} button - The clicked return button.
   * @returns {void}
   */
  function handleReturnDialogButtonClick(button) {
    const dialogId = button.getAttribute("data-return-dialog-target");
    const currentDialog = button.closest("dialog");

    if (currentDialog instanceof HTMLDialogElement && currentDialog.id) closeDialogById(currentDialog.id);

    openDialogById(dialogId);
  }

  /**
   * Checks whether any meta dialog is currently open.
   *
   * @returns {boolean} True when at least one dialog with `.metaDialog` is open.
   */
  function isMetaDialogOpen() {
    return Array.from(document.querySelectorAll(".metaDialog")).some((dialog) => dialog.open);
  }

  return {
    initDialogBackdropClose,
    initGameMenu,
    initStartScreenDialogs,
    isMetaDialogOpen,
  };
}