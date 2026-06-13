class World {
  character = new Character();
  lifeBar = new LifeBar();
  coinsBar = new CoinsBar();
  throwableObjects = new ThrowableObject();
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
    this.checkCollisions();
  }

  setWorld() {
    this.character.world = this;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgrounds();

    this.ctx.translate(this.camera_x, 0);
    
    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.lifeBar);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.ctx.translate(this.camera_x, 0);
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
    if (movableObject.imgDirectionChange) this.flipImage(movableObject);
    movableObject.draw(this.ctx);
    movableObject.drawCollisionArea(this.ctx);
    if (movableObject.imgDirectionChange) this.ctx.restore();
  }

  flipImage(movableObject) {
    this.ctx.save();
    this.ctx.translate(movableObject.x + movableObject.width / 2, 0);
    this.ctx.scale(-1, 1);
    this.ctx.translate(-movableObject.x - movableObject.width / 2, 0);
  }

  checkCollisions() {
    setInterval(() => {
      this.lvl.platformObjects.forEach(platform => {
        if (this.character.isLandingOn(platform)) {
          this.character.landOn(platform);
        }
      });

      this.collectCoins();

      let stompedEnemy = this.lvl.enemies.find(enemy =>
        !enemy.isDying && !enemy.isDead &&
        this.character.isColliding(enemy) && this.isStompingEnemy(enemy)
      );

      if (stompedEnemy) {
        this.bounceOffEnemy(stompedEnemy);
        this.handleEnemyDefeat(stompedEnemy);
        return;
      }

      this.lvl.enemies.forEach(enemy => {
        if (enemy.isDying || enemy.isDead) return;

        if (this.character.isColliding(enemy) && !this.character.isHurt()) {
          this.character.startKnockback();
          this.character.hit();
        }
      });
    }, 1000 / 60);
  }

  collectCoins() {
    let collectedCoins = this.lvl.environmentObjects.filter(object =>
      object instanceof Coins && this.isCollidingWithCharacter(object)
    );

    if (collectedCoins.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof Coins && this.isCollidingWithCharacter(object))
    );

    this.coinsBar.addCoin(collectedCoins.length);
  }

  isCollidingWithCharacter(object) {
    let characterArea = this.character.getCollisionArea();
    let objectArea = object.getCollisionArea();

    return (
      characterArea.x + characterArea.width > objectArea.x &&
      characterArea.x < objectArea.x + objectArea.width &&
      characterArea.y + characterArea.height > objectArea.y &&
      characterArea.y < objectArea.y + objectArea.height
    );
  }

  // Check if the character is stomping on the enemy
  isStompingEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();
    let characterFeet = characterArea.y + characterArea.height;

    return this.character.vcY < 0 && characterFeet <= enemyArea.y + 25;
  }

  bounceOffEnemy(enemy) {
    let characterArea = this.character.getCollisionArea();
    let enemyArea = enemy.getCollisionArea();

    this.character.y = enemyArea.y - characterArea.height - characterArea.offsetY;
    this.character.vcY = 5;
  }

  handleEnemyDefeat(enemy) {
    let dyingDuration = enemy.die();

    setTimeout(() => {
      this.spawnCoinAt(enemy);
      this.removeEnemy(enemy);
    }, dyingDuration);
  }

  spawnCoinAt(enemy) {
    let enemyArea = enemy.getCollisionArea();
    let coinX = enemyArea.x + enemyArea.width / 2 - 15;
    let coinY = enemyArea.y + enemyArea.height / 2 - 15;

    this.lvl.environmentObjects.push(new Coins(coinX, coinY));
  }

  removeEnemy(enemyToRemove) {
    this.lvl.enemies = this.lvl.enemies.filter(enemy => enemy !== enemyToRemove);
  }
}