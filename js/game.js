import { Keyboard } from '../models/keyboard.class.js';
import { createGameBackgroundAudio, getMusicMuted, playBackgroundAudio, setMusicMuted } from './audio.js';
import { createDialogController } from './dialog.js';
import { StartScreen } from '../models/start-screen-class.js';
import { World } from '../models/world.class.js';
import { lvl_1 } from '../lvl/lvl_1.js';
import { lvl_2 } from '../lvl/lvl-2.js';

let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let gameBackgroundAudio = createGameBackgroundAudio();
let isIntroVisible = true;
let isStartScreenVisible = true;
let isStartTransitionRunning = false;
const baseCanvasWidth = 720;
const baseCanvasHeight = 480;
const introTransitionDuration = 700;
const gameMenuDialogIds = ["gameMenuDialog", "settingsDialog", "instructionsDialog", "impressumDialog", "datenschutzDialog", "creditsDialog"];
const currentLevelStorageKey = "loco.currentLevel";
const skipStartScreenStorageKey = "loco.skipStartScreen";
const dialogController = createDialogController({
  gameMenuDialogIds,
  getWorld: () => world,
  isGameCanvasVisible,
});

function getSelectedLevelId() {
  return sessionStorage.getItem(currentLevelStorageKey) ?? "lvl_1";
}

function setSelectedLevelId(levelId) {
  sessionStorage.setItem(currentLevelStorageKey, levelId);
}

function getSelectedLevel() {
  return getSelectedLevelId() === "lvl_2" ? lvl_2 : lvl_1;
}

function shouldSkipStartScreen() {
  return sessionStorage.getItem(skipStartScreenStorageKey) === "true";
}

function setSkipStartScreen(shouldSkip) {
  if (shouldSkip) {
    sessionStorage.setItem(skipStartScreenStorageKey, "true");
    return;
  }

  sessionStorage.removeItem(skipStartScreenStorageKey);
}

function init() {
  canvas = document.getElementById("gameCanvas");
  syncGameCanvasSize();
  dialogController.initDialogBackdropClose();
  dialogController.initGameMenu();
  dialogController.initStartScreenDialogs();
  initMusicToggle();
  initGameCanvasResizeHandling();
  startSavedLevelIfNeeded();
}

function startSavedLevelIfNeeded() {
  const shouldBootIntoGame = shouldSkipStartScreen() || getSelectedLevelId() !== "lvl_1";

  if (!shouldBootIntoGame) return;

  setSkipStartScreen(false);
  document.body?.classList.remove("intro-mode", "intro-transition");
  document.body?.classList.add("game-active");
  document.body?.classList.add("skip-start-screen");
  isIntroVisible = false;
  showGameCanvas();
  fadeIntoGame();
}

function getGameCanvasShell() {
  return document.getElementById("gameCanvasShell");
}

async function toggleGameCanvasFullscreen() {
  const gameCanvasShell = getGameCanvasShell();

  if (!document.fullscreenEnabled || !(gameCanvasShell instanceof HTMLElement) || !isGameCanvasVisible()) return;

  if (document.fullscreenElement === gameCanvasShell) {
    await document.exitFullscreen().catch(() => { });
    return;
  }

  await gameCanvasShell.requestFullscreen().catch(() => { });
}

function isGameCanvasFullscreen() {
  return document.fullscreenElement === getGameCanvasShell();
}

function getFullscreenCanvasDimensions() {
  const scale = Math.min(window.innerWidth / baseCanvasWidth, window.innerHeight / baseCanvasHeight);

  return {
    width: Math.floor(baseCanvasWidth * scale),
    height: Math.floor(baseCanvasHeight * scale),
  };
}

function syncGameCanvasSize() {
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const nextWidth = baseCanvasWidth;
  const nextHeight = baseCanvasHeight;
  const fullscreenDimensions = getFullscreenCanvasDimensions();
  const styleWidth = isGameCanvasFullscreen() ? fullscreenDimensions.width : nextWidth;
  const styleHeight = isGameCanvasFullscreen() ? fullscreenDimensions.height : nextHeight;

  canvas.width = nextWidth;
  canvas.height = nextHeight;

  if (isStartTransitionRunning) return;

  canvas.style.setProperty("width", `${styleWidth}px`);
  canvas.style.setProperty("height", `${styleHeight}px`);
}

function initGameCanvasResizeHandling() {
  document.addEventListener("fullscreenchange", syncGameCanvasSize);
  window.addEventListener("resize", syncGameCanvasSize);
}

function isGameCanvasVisible() {
  const gameCanvasShell = document.getElementById("gameCanvasShell");
  return Boolean(gameCanvasShell && gameCanvasShell.style.display !== "none");
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

  world = new World(canvas, keyboard, gameBackgroundAudio, getSelectedLevel());
}

function restartGame() {
  setSkipStartScreen(true);
  window.location.reload();
}

function startLevel(levelId) {
  setSelectedLevelId(levelId);
  setSkipStartScreen(true);
  window.location.reload();
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
  body?.classList.add("game-active");
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
  const targetWidth = baseCanvasWidth;
  const targetHeight = baseCanvasHeight;

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
    isStartTransitionRunning = false;
    syncGameCanvasSize();
    body?.classList.remove("game-transitioning");
    playBackgroundAudio(gameBackgroundAudio);
  };

  requestAnimationFrame(revealGame);
}

function startGameTransition() {
  if (!isStartScreenVisible || isStartTransitionRunning) return;

  const overlay = document.getElementById("transitionOverlay");
  const startedAt = performance.now();
  const duration = 900;
  const completeTransition = () => {
    if (!isStartScreenVisible) return;

    showGameCanvas();
    fadeIntoGame();
  };

  isStartTransitionRunning = true;

  if (!startScreen?.isReady) {
    completeTransition();
  } else {
    startScreen.beginTransition(completeTransition);
  }

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
  if (e.key === "F11") {
    e.preventDefault();
    toggleGameCanvasFullscreen();
    return;
  }

  if (dialogController.isMetaDialogOpen()) {
    return;
  }

  if (world?.character?.isDead && world.isGameOverRetryReady?.()) {
    restartGame();
    return;
  }

  if (world?.victoryOverlayVisible && world.isVictoryPromptReady?.()) {
    startLevel("lvl_2");
    return;
  }

  if (isIntroVisible) {
    showStartScreen();
    return;
  }

  if (isStartScreenVisible && e.key === " ") {
    e.preventDefault();
    keyboard.SPACE = true;
    startGameTransition();
    return;
  }

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