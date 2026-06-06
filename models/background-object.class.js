class BackgroundObject extends MovableObject {

  constructor(imgPath) {
    super().loadImage(imgPath);
    this.x = 0;
    this.y = 0;
    this.width = canvas.width;
    this.height = canvas.height;
  }
}