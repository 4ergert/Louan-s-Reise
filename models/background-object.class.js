class BackgroundObject extends MovableObject {

  constructor(imgPath, width = 720, height = 480) {
    super();
    this.loadImage(imgPath);
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
  }
}