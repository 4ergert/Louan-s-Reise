class MovableObject {
  x = 0;
  y = 300;
  img;
  width = 150;
  height = 150;
  imgCache = {};
  currentImage = 0;
  imgDirectionChange = false;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  loadImages(arr) {
    arr.forEach(path => {
      let img = new Image();
      img.src = path;
      this.imgCache[path] = img;
    });
  }

  moveRight() {
    this.x += 5;
  }

  moveLeft() {
    if (this.x > 0) {
      this.x -= 5;
    }
  }
}