import { Keyboard } from '../models/keyboard.class.js';
import { StartScreen } from '../models/start-screen-class.js';
import { World } from '../models/world.class.js';

let canvas;
let world;
let keyboard = new Keyboard();
let startScreen;
let isStartScreenVisible = true;

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
  isStartScreenVisible = false;
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
      showGameCanvas();
      break;
    case "Control":
      keyboard.CTRL = true;
      break;
    case "Shift":
      keyboard.SHIFT = true;
      break;
    case "x":
    case "X":
      keyboard.X = true;
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
    case "Shift":
      keyboard.SHIFT = false;
      break;
    case "x":
    case "X":
      keyboard.X = false;
      break;
  }
});

init();