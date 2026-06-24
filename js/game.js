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
const introTransitionDuration = 700;

function init() {
  canvas = document.getElementById("gameCanvas");
  initStartScreenDialogs();
  initMusicToggle();
}

function initMusicToggle() {
  const musicToggleButton = document.getElementById("musicToggleButton");

  if (!(musicToggleButton instanceof HTMLButtonElement)) return;

  const renderButtonState = () => {
    const isMuted = getMusicMuted();
    musicToggleButton.textContent = isMuted ? "✕" : "♪";
    musicToggleButton.setAttribute("aria-pressed", `${isMuted}`);
    musicToggleButton.setAttribute("aria-label", isMuted ? "Musik einschalten" : "Musik stummschalten");
    musicToggleButton.dataset.muted = `${isMuted}`;
  };

  renderButtonState();
  musicToggleButton.addEventListener("click", () => {
    setMusicMuted(!getMusicMuted());
    renderButtonState();
  });
}

function initStartScreenDialogs() {
  const dialogButtons = document.querySelectorAll("[data-dialog-target]");

  dialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialogId = button.getAttribute("data-dialog-target");
      const dialog = dialogId ? document.getElementById(dialogId) : null;

      if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;

      dialog.showModal();
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

  world = new World(canvas, keyboard);
}

function showGameCanvas() {
  if (!isStartScreenVisible) return;

  const body = document.body;
  const startScreenElement = document.getElementById("startScreen");
  const startScreenCanvas = document.getElementById("startScreenCanvas");
  const startScreenControls = document.getElementById("startScreenControls");
  const startScreenMeta = document.getElementById("startScreenMeta");

  startScreen?.stop();
  body?.classList.add("game-transitioning");
  startScreenElement?.style.setProperty("display", "none");
  startScreenCanvas?.style.setProperty("display", "none");
  startScreenControls?.style.setProperty("display", "none");
  startScreenMeta?.style.setProperty("display", "none");
  canvas?.style.setProperty("display", "block");
  canvas?.style.setProperty("opacity", "0");
  canvas?.style.setProperty("width", "0px");
  canvas?.style.setProperty("height", "0px");
  isStartScreenVisible = false;
}

function fadeIntoGame() {
  const body = document.body;
  const overlay = document.getElementById("transitionOverlay");
  const startedAt = performance.now();
  const duration = 700;
  const targetWidth = canvas?.width ?? 720;
  const targetHeight = canvas?.height ?? 480;

  initWorld();

  const revealGame = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 2);

    canvas?.style.setProperty("opacity", `${easedProgress}`);
    canvas?.style.setProperty("width", `${targetWidth * easedProgress}px`);
    canvas?.style.setProperty("height", `${targetHeight * easedProgress}px`);
    overlay?.style.setProperty("opacity", `${1 - easedProgress}`);

    if (progress < 1) {
      requestAnimationFrame(revealGame);
      return;
    }

    overlay?.style.setProperty("opacity", "0");
    canvas?.style.setProperty("opacity", "1");
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