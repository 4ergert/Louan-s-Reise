class BackgroundObject extends MovableObject {

  constructor(imgPath, parallaxFactor = 1, x = 0, width = 720, height = 480) {
    super();
    this.loadImage(imgPath);
    this.parallaxFactor = parallaxFactor;
    this.x = x;
    this.y = 0;
    this.width = width;
    this.height = height;
  }
}