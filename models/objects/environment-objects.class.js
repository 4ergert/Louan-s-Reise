class EnvironmentObject extends MovableObject {
  constructor(imgPath, x, y, width, height) {
    super();
    this.img = new Image();
    this.img.src = imgPath;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}