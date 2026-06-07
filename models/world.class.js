class World {

  character = new Character();
  lvl = lvl_1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
  }

  setWorld() {
    this.character.world = this;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgrounds(); // Draw backgrounds before translating the context for parallax effect

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.lvl.enemies);
    this.addToMap(this.character);

    this.ctx.translate(-this.camera_x, 0);

    
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  // Draw backgrounds with parallax effect
  drawBackgrounds() {
    this.lvl.backgroundObjects.forEach(background => {
      const offsetX = this.camera_x * background.parallaxFactor;

      this.ctx.save();
      this.ctx.translate(offsetX, 0);
      this.addToMap(background);
      this.ctx.restore();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach(object => {
      this.addToMap(object);
    });
  }

  addToMap(movableObject) {
    if (movableObject.imgDirectionChange) {
      this.ctx.save();
      this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
      this.ctx.scale(-1, 1);
      this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
    }
    this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
    if (movableObject.imgDirectionChange) {
      this.ctx.restore();
    }
  }
}