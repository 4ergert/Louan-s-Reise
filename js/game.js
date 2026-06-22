import { Keyboard } from '../models/keyboard.class.js';
import { StartScreen } from '../models/start-screen-class.js';
import { World } from '../models/world.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let isStartScreenVisible = true;
let isStartTransitionRunning = false;

function init() {
  canvas = document.getElementById("gameCanvas");
  const startScreenCanvas = document.getElementById("startScreenCanvas");

  if (startScreenCanvas) {
    startScreen = new StartScreen(startScreenCanvas);
    startScreen.start();
  }

  if (canvas) {
    world = new World(canvas, keyboard);
  }
}

function showGameCanvas() {
  if (!isStartScreenVisible) return;

  const startScreenElement = document.getElementById("startScreen");
  const startScreenCanvas = document.getElementById("startScreenCanvas");

  startScreen?.stop();
  startScreenElement?.style.setProperty("display", "none");
  startScreenCanvas?.style.setProperty("display", "none");
  canvas?.style.setProperty("display", "block");
  canvas?.style.setProperty("opacity", "0");
  isStartScreenVisible = false;
}

function fadeIntoGame() {
  const overlay = document.getElementById("transitionOverlay");
  const startedAt = performance.now();
  const duration = 700;

  const revealGame = (timestamp) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 2);

    canvas?.style.setProperty("opacity", `${easedProgress}`);
    overlay?.style.setProperty("opacity", `${1 - easedProgress}`);

    if (progress < 1) {
      requestAnimationFrame(revealGame);
      return;
    }

    overlay?.style.setProperty("opacity", "0");
    canvas?.style.setProperty("opacity", "1");
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

init();