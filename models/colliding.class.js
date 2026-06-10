class Colliding {
  isColliding(movableObject) {
    let ownCollisionArea = this.getCollisionArea();
    let otherCollisionArea = movableObject.getCollisionArea();

    return (
      ownCollisionArea.x + ownCollisionArea.width > otherCollisionArea.x &&
      ownCollisionArea.x < otherCollisionArea.x + otherCollisionArea.width &&
      ownCollisionArea.y + ownCollisionArea.height > otherCollisionArea.y &&
      ownCollisionArea.y < otherCollisionArea.y + otherCollisionArea.height
    );
  }

  isLandingOn(platform) {
    let ownCollisionArea = this.getCollisionArea();
    let platformArea = platform.getCollisionArea();
    let feet = ownCollisionArea.y + ownCollisionArea.height;

    return (
      this.vcY <= 0 &&
      ownCollisionArea.x + ownCollisionArea.width > platformArea.x &&
      ownCollisionArea.x < platformArea.x + platformArea.width &&
      ownCollisionArea.y < platformArea.y &&
      feet >= platformArea.y &&
      feet <= platformArea.y + 20
    );
  }

  landOn(platform) {
    let ownCollisionArea = this.getCollisionArea();
    let platformArea = platform.getCollisionArea();

    this.y = platformArea.y - ownCollisionArea.height - ownCollisionArea.offsetY;
    this.vcY = 0;
  }
}

let collidingMethods = Object.getOwnPropertyDescriptors(Colliding.prototype);
delete collidingMethods.constructor;
Object.defineProperties(MovableObject.prototype, collidingMethods);
