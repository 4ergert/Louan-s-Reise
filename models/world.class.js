class World {

  character = new Character();
  enemies = [
    new SkeletonWarriorLVL1(),
    new SkeletonWarriorLVL1(),
    new SkeletonWarriorLVL1()
  ];
  backgroundObjects = [
    new BackgroundObject('img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 00.png'),
    new BackgroundObject('img/Background/Autumn_Forest_2D_Platformer_Tileset_Background - Layer 01.png')
  ];
  canvas;
  ctx;

  constructor(canvas) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.draw();
  }


  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.addObjectsToMap(this.backgroundObjects);
    this.addObjectsToMap(this.enemies);
    this.addToMap(this.character);

    
    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  addObjectsToMap(objects) {
    objects.forEach(object => {
      this.addToMap(object);
    });
  }

  addToMap(movableObject) {
    this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y, movableObject.width, movableObject.height);
  }
}