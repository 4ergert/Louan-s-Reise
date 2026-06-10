let canvas;
let world;
let keyboard = new Keyboard();

function init() {
  canvas = document.getElementById("gameCanvas");
  world = new World(canvas, keyboard);

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
      break;
    case "Control":
      keyboard.CTRL = true;
      break;
    case "Shift":
      keyboard.SHIFT = true;
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
  }
});