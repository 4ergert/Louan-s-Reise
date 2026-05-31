class Character extends MovableObject {

  jump() {
    this.y -= 10;
  }

  moveLeft() {
    this.x -= 5;
  }
}