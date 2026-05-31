let canvas;
let ctx;
let character = new Character();
let skeletonWarriors = [
  new SkeletonWarrior1(), 
  new SkeletonWarrior1(), 
  new SkeletonWarrior1()
];

function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  console.log(character);
}