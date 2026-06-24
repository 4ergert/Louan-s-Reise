import { Keyboard } from '../models/keyboard.class.js';
import { createGameBackgroundAudio, getMusicMuted, playBackgroundAudio, setMusicMuted } from './audio.js';
import { StartScreen } from '../models/start-screen-class.js';
import { World } from '../models/world.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameBackgroundAudio = createGameBackgroundAudio();
let isIntroVisible = true;
let isStartScreenVisible = true;
let isStartTransitionRunning = false;
let isGameMenuPauseActive = false;
const introTransitionDuration = 700;
const gameMenuDialogIds = ["gameMenuDialog", "settingsDialog", "instructionsDialog", "impressumDialog", "datenschutzDialog", "creditsDialog"];

function init() {
  canvas = document.getElementById("gameCanvas");
  initDialogBackdropClose();
  initGameMenu();
  initStartScreenDialogs();
  initMusicToggle();
}

function initDialogBackdropClose() {
  const dialogs = document.querySelectorAll(".metaDialog");

  dialogs.forEach((dialog) => {
    if (!(dialog instanceof HTMLDialogElement)) return;

    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;

      dialog.close();
      syncGameMenuPauseState();
    });
  });
}

function isGameCanvasVisible() {
  const gameCanvasShell = document.getElementById("gameCanvasShell");
  return Boolean(gameCanvasShell && gameCanvasShell.style.display !== "none");
}

function isAnyGameMenuDialogOpen() {
  return gameMenuDialogIds.some((dialogId) => {
    const dialog = document.getElementById(dialogId);
    return dialog instanceof HTMLDialogElement && dialog.open;
  });
}

function syncGameMenuPauseState() {
  if (!world || !isGameCanvasVisible()) return;

  const shouldPauseForMenu = isAnyGameMenuDialogOpen();

  if (shouldPauseForMenu) {
    if (!world.isPaused) {
      isGameMenuPauseActive = true;
      world.isPaused = true;
      world.resetKeyboard?.();
    }
    return;
  }

  if (!isGameMenuPauseActive) return;

  isGameMenuPauseActive = false;
  world.isPaused = false;
  world.resetKeyboard?.();
}

function initGameMenuDialogPause() {
  gameMenuDialogIds.forEach((dialogId) => {
    const dialog = document.getElementById(dialogId);

    if (!(dialog instanceof HTMLDialogElement)) return;

    dialog.addEventListener("close", syncGameMenuPauseState);
    dialog.addEventListener("cancel", () => {
      window.setTimeout(syncGameMenuPauseState, 0);
    });
  });
}

function openDialogById(dialogId) {
  openDialogByIdWithOptions(dialogId);
}

function openDialogByIdWithOptions(dialogId, options = {}) {
  if (!dialogId) return;

  const dialog = document.getElementById(dialogId);

  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;

  updateDialogMenuReturnState(dialog, Boolean(options.fromGameMenu));
  dialog.showModal();
  syncGameMenuPauseState();
}

function updateDialogMenuReturnState(dialog, shouldShow) {
  const backToMenuButton = dialog.querySelector(".backToMenuButton");

  if (!(backToMenuButton instanceof HTMLButtonElement)) return;

  backToMenuButton.hidden = !shouldShow;
}

function closeDialogById(dialogId) {
  const dialog = document.getElementById(dialogId);

  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;

  dialog.close();
  updateDialogMenuReturnState(dialog, false);
  syncGameMenuPauseState();
}

function initGameMenu() {
  const gameMenuButton = document.getElementById("gameMenuButton");

  initGameMenuDialogPause();

  if (!(gameMenuButton instanceof HTMLButtonElement)) return;

  gameMenuButton.addEventListener("click", () => {
    openDialogById("gameMenuDialog");
  });
}

function initMusicToggle() {
  const musicToggleButtons = document.querySelectorAll("[data-music-toggle], #musicToggleButton");

  if (!musicToggleButtons.length) return;

  const renderButtonState = () => {
    const isMuted = getMusicMuted();

    musicToggleButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;

      button.textContent = isMuted ? "✕" : "♪";
      button.setAttribute("aria-pressed", `${isMuted}`);
      button.setAttribute("aria-label", isMuted ? "Musik einschalten" : "Musik stummschalten");
      button.dataset.muted = `${isMuted}`;
    });
  };

  renderButtonState();
  musicToggleButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;

    button.addEventListener("click", () => {
      setMusicMuted(!getMusicMuted());
      renderButtonState();
    });
  });
}

function initStartScreenDialogs() {
  const dialogButtons = document.querySelectorAll("[data-dialog-target]");
  const returnButtons = document.querySelectorAll("[data-return-dialog-target]");

  dialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialogId = button.getAttribute("data-dialog-target");
      const fromGameMenu = Boolean(button.closest("#gameMenuDialog"));

      if (button.closest("#gameMenuDialog")) {
        closeDialogById("gameMenuDialog");
      }
      openDialogByIdWithOptions(dialogId, { fromGameMenu });
    });
  });

  returnButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!(button instanceof HTMLButtonElement)) return;

      const dialogId = button.getAttribute("data-return-dialog-target");
      const currentDialog = button.closest("dialog");

      if (currentDialog instanceof HTMLDialogElement && currentDialog.id) {
        closeDialogById(currentDialog.id);
      }

      openDialogById(dialogId);
    });
  });
}

function isMetaDialogOpen() {
  return Array.from(document.querySelectorAll(".metaDialog")).some((dialog) => dialog.open);
}

function showStartScreen() {
  if (!isIntroVisible) return;

  const body = document.body;
  const startScreenCanvas = document.getElementById("startScreenCanvas");

  isIntroVisible = false;

  body?.classList.add("intro-transition");

  window.setTimeout(() => {
    body?.classList.remove("intro-mode", "intro-transition");

    if (startScreenCanvas && !startScreen) {
      startScreen = new StartScreen(startScreenCanvas);
    }

    startScreen?.start();
  }, introTransitionDuration);
}

function initWorld() {
  if (!canvas || world) return;

  world = new World(canvas, keyboard, gameBackgroundAudio);
}

function showGameCanvas() {
  if (!isStartScreenVisible) return;

  const body = document.body;
  const startScreenElement = document.getElementById("startScreen");
  const startScreenCanvas = document.getElementById("startScreenCanvas");
  const startScreenControls = document.getElementById("startScreenControls");
  const startScreenMeta = document.getElementById("startScreenMeta");
  const gameCanvasShell = document.getElementById("gameCanvasShell");

  startScreen?.stop();
  body?.classList.add("game-transitioning");
  startScreenElement?.style.setProperty("display", "none");
  startScreenCanvas?.style.setProperty("display", "none");
  startScreenControls?.style.setProperty("display", "none");
  startScreenMeta?.style.setProperty("display", "none");
  gameCanvasShell?.style.setProperty("display", "block");
  gameCanvasShell?.style.setProperty("opacity", "0");
  canvas?.style.setProperty("width", "0px");
  canvas?.style.setProperty("height", "0px");
  isStartScreenVisible = false;
}

function fadeIntoGame() {
  const body = document.body;
  const overlay = document.getElementById("transitionOverlay");
  const gameCanvasShell = document.getElementById("gameCanvasShell");
  const startedAt = performance.now();
  const duration = 700;
  const targetWidth = canvas?.width ?? 720;
  const targetHeight = canvas?.height ?? 480;

  initWorld();

  const revealGame = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 2);

    gameCanvasShell?.style.setProperty("opacity", `${easedProgress}`);
    canvas?.style.setProperty("width", `${targetWidth * easedProgress}px`);
    canvas?.style.setProperty("height", `${targetHeight * easedProgress}px`);
    overlay?.style.setProperty("opacity", `${1 - easedProgress}`);

    if (progress < 1) {
      requestAnimationFrame(revealGame);
      return;
    }

    overlay?.style.setProperty("opacity", "0");
    gameCanvasShell?.style.setProperty("opacity", "1");
    canvas?.style.setProperty("width", `${targetWidth}px`);
    canvas?.style.setProperty("height", `${targetHeight}px`);
    body?.classList.remove("game-transitioning");
    playBackgroundAudio(gameBackgroundAudio);
    isStartTransitionRunning = false;
  };

  requestAnimationFrame(revealGame);
}

function startGameTransition() {
  if (!isStartScreenVisible || isStartTransitionRunning) return;

  const overlay = document.getElementById("transitionOverlay");
  const startedAt = performance.now();
  const duration = 900;

  isStartTransitionRunning = true;
  startScreen?.beginTransition(() => {
    showGameCanvas();
    fadeIntoGame();
  });

  const fadeOverlay = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);

    overlay?.style.setProperty("opacity", `${progress}`);

    if (progress < 1) {
      requestAnimationFrame(fadeOverlay);
    }
  };

  requestAnimationFrame(fadeOverlay);
}

window.addEventListener("keydown", (e) => {
  if (isMetaDialogOpen()) {
    return;
  }

  if (isIntroVisible) {
    showStartScreen();
    return;
  }

  // console.log(e.key);
  switch (e.key) {
    case "ArrowLeft":
      keyboard.LEFT = true;
      break;
    case "ArrowUp":
      keyboard.UP = true;
      break;
    case "ArrowRight":
      keyboard.RIGHT = true;
      break;
    case "ArrowDown":
      keyboard.DOWN = true;
      break;
    case "d":
    case "D":
      keyboard.D = true;
      break;
    case " ":
      keyboard.SPACE = true;
      startGameTransition();
      break;
    case "Control":
      keyboard.CTRL = true;
      break;
    case "a":
      keyboard.A = true;
      break;
    case "f":
      keyboard.F = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      keyboard.LEFT = false;
      break;
    case "ArrowUp":
      keyboard.UP = false;
      break;
    case "ArrowRight":
      keyboard.RIGHT = false;
      break;
    case "ArrowDown":
      keyboard.DOWN = false;
      break;
    case " ":
      keyboard.SPACE = false;
      break;
    case "d":
    case "D":
      keyboard.D = false;
      break;
    case "Control":
      keyboard.CTRL = false;
      break;
    case "a":
      keyboard.A = false;
      break;
    case "f":
      keyboard.F = false;
      break;
  }
});

window.addEventListener("load", init);