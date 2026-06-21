import { createBloodSplatterParticles } from '../js/world-effects.js';
import { drawBloodSplatter, drawBossLifeBar, drawGameOverOverlay } from '../js/world-renderer.js';
import { Character } from './character/character.class.js';
import { LifeBar } from './character/life-bar.class.js';
import { CoinsBar } from './lvl-1/coins-bar.class.js';
import { Coins } from './lvl-1/coins.class.js';
import { ThrowableObject } from './objects/throwable-objects.class.js';
import { WorldIntros } from './world-intros.class.js';
import { lvl_1 } from '../lvl/lvl_1.js';
import { isCollidingWithCharacter, isColliding, isCharacterWithinBossSlashRange } from '../js/colliding-objects.js';
import { isSpawning } from './character/char-movements.js';
import { startKnockback, startThrowingAnimation } from './character/char-animation-actions.js';

export class World extends WorldIntros {
  character = new Character();
  lifeBar = new LifeBar();
  coinsBar = new CoinsBar();
  throwableObjects = new ThrowableObject(16, 111, true);
  thrownRooks = [];
  lvl = lvl_1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  throwInputLocked = false;
  bloodSplatterParticles = [];
  isPaused = false;

  constructor(canvas, keyboard) {
    super();
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.applyLevelWorldSettings();
    this.draw();
    this.setWorld();
    this.checkCollisions();
  }

  setWorld() {
    this.assignWorld(this.character);
    this.assignWorld(this.throwableObjects);
    this.assignWorldToAll(this.lvl.enemies);
    this.assignWorldToAll(this.lvl.environmentObjects);
  }

  get bossLVL1() {
    return this.lvl.enemies.find(enemy => enemy.isBoss);
  }

  isCharacterWithinBossSlashRange() {
    return isCharacterWithinBossSlashRange.call(this);
  }

  // Helper method to assign world reference to a drawable object and its children (if any)
  assignWorld(drawableObject) {
    if (drawableObject) drawableObject.world = this;
  }

  // Helper method to assign world reference to multiple objects at once
  assignWorldToAll(drawableObjects) {
    drawableObjects.forEach(drawableObject => this.assignWorld(drawableObject));
  }

  draw() {
    this.updateOpeningIntro();
    this.updateBossIntro();
    this.handleIntroSkip();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackgrounds();

    this.ctx.translate(this.camera_x, 0);

    this.addObjectsToMap(this.lvl.platformObjects);
    this.addObjectsToMap(this.lvl.environmentObjects);
    this.addObjectsToMap(this.lvl.enemies);
    this.addObjectsToMap(this.thrownRooks);

    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.lifeBar);
    if (this.shouldShowBossLifeBar()) drawBossLifeBar(this.ctx, this.camera_x, this.bossLVL1, this.canvas);
    this.addToMap(this.coinsBar);
    this.addToMap(this.throwableObjects);
    this.ctx.translate(this.camera_x, 0);
    this.addToMap(this.character);

    this.ctx.translate(-this.camera_x, 0);

    if (this.character.isDead) {
      drawGameOverOverlay(this.ctx, this.canvas);
    }

    if (this.isOpeningIntroActive()) {
      this.drawOpeningIntroBubble();
    }

    if (this.isBossIntroActive()) {
      this.drawBossIntroBubble();
    }

    // this.drawBloodSplatter();



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

  drawBloodSplatter() {
    if (this.bloodSplatterParticles.length === 0) return;

    this.bloodSplatterParticles = drawBloodSplatter(
      this.ctx,
      this.camera_x,
      this.bloodSplatterParticles,
      Date.now()
    );
  }

  spawnBloodSplatter() {
    let characterArea = this.character.getCollisionArea();
    let originX = characterArea.x + characterArea.width / 2;
    let originY = characterArea.y + characterArea.height / 3;
    let direction = this.bossLVL1.x < this.character.x ? 1 : -1;
    let particles = createBloodSplatterParticles(originX, originY, direction, Date.now());

    this.bloodSplatterParticles.push(...particles);
  }

  updateOpeningIntro() {
    if (this.openingIntroTriggered || this.character.isDead || isSpawning(this.character)) return;

    this.openingIntroTriggered = true;
    this.isPaused = true;
    this.openingIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.openingIntroTimeout = setTimeout(() => {
      this.finishOpeningIntro();
    }, this.openingIntroDuration);
  }

  updateBossIntro() {
    if (!this.openingIntroCompleted || this.bossIntroTriggered || this.character.isDead) return;
    if (!this.bossLVL1) return;
    if (!this.isBossFullyVisible() || !this.isCharacterNearBoss()) return;

    this.bossIntroTriggered = true;
    this.isPaused = true;
    this.bossIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.bossIntroTimeout = setTimeout(() => {
      this.finishBossIntro();
    }, this.bossIntroDuration);
  }

  isBossFullyVisible() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    return bossScreenX >= 0 && bossScreenX + this.bossLVL1.width <= this.canvas.width + 100;
  }

  isCharacterNearBoss() {
    let characterRightEdge = this.character.x + this.character.width;
    return this.bossLVL1.x - characterRightEdge <= 400;
  }

  shouldShowBossLifeBar() {
    return this.bossIntroTriggered && !this.isBossIntroActive() && this.bossLVL1 && !this.bossLVL1.isDead;
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
      if (this.isPaused) return;

      this.lvl.platformObjects.forEach(platform => {
        if (this.character.isLandingOn(platform)) {
          this.character.landOn(platform);
        }
      });

      this.collectCoins();
      this.collectRooks();
      this.handleThrowInput();
      this.updateThrownRooks();
      this.updateBossAttackState();

      let stompedEnemy = this.lvl.enemies.find(enemy =>
        !enemy.isBoss &&
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
        if (enemy.isBoss) return;

        if (this.character.isColliding(enemy) && !this.character.isHurt()) {
          startKnockback(this.character, enemy.x + enemy.width / 2);
          this.character.hit();
        }
      });
    }, 1000 / 60);
  }

  updateBossAttackState() {
    if (!this.bossLVL1) return;

    this.bossLVL1.setSlashingState(this.isCharacterWithinBossSlashRange());
  }

  handleBossSlashHit() {
    if (!this.bossLVL1 || this.bossLVL1.isDead) return;
    if (!this.isCharacterWithinBossSlashRange()) return;

    if (this.character.isDead) {
      this.spawnBloodSplatter();
      return;
    }

    if (this.character.isHurt()) return;

    startKnockback(this.character, this.bossLVL1.x + this.bossLVL1.width / 2);
    this.character.hit();
    this.spawnBloodSplatter();
  }

  collectCoins() {
    let collectedCoins = this.lvl.environmentObjects.filter(object =>
      object instanceof Coins && isCollidingWithCharacter(this.character, object)
    );

    if (collectedCoins.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof Coins && isCollidingWithCharacter(this.character, object))
    );

    this.coinsBar.addCoin(collectedCoins.length);
  }

  collectRooks() {
    let collectedRooks = this.lvl.environmentObjects.filter(object =>
      object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object)
    );

    if (collectedRooks.length === 0) return;

    this.lvl.environmentObjects = this.lvl.environmentObjects.filter(object =>
      !(object instanceof ThrowableObject && isCollidingWithCharacter(this.character, object))
    );

    this.throwableObjects.addRook(collectedRooks.length);
  }

  handleThrowInput() {
    if (this.keyboard.X && !this.throwInputLocked && this.throwableObjects.rooks > 0) {
      startThrowingAnimation(this.character);
      this.throwRook();
      this.throwInputLocked = true;
    }

    if (!this.keyboard.X) {
      this.throwInputLocked = false;
    }
  }

  throwRook() {
    let direction = this.character.imgDirectionChange ? -1 : 1;
    let rookX = direction > 0 ? this.character.x + this.character.width - 60 : this.character.x + 30
    let rookY = this.character.y + 80;
    let rook = new ThrowableObject(rookX, rookY);

    this.assignWorld(rook);
    rook.launch(direction);
    this.thrownRooks.push(rook);
    this.throwableObjects.removeRook(1);
  }

  updateThrownRooks() {
    this.thrownRooks.forEach(rook => rook.updateThrow());
    this.handleThrownRookHits();
    this.thrownRooks = this.thrownRooks.filter(rook => !rook.hasHitTarget && !rook.isOffscreen(this.camera_x, this.canvas.width));
  }

  handleThrownRookHits() {
    this.thrownRooks.forEach(rook => {
      let hitEnemy = this.lvl.enemies.find(enemy =>
        !enemy.isDying &&
        !enemy.isDead &&
        rook.isColliding(enemy)
      );

      if (!hitEnemy) return;

      rook.hasHitTarget = true;

      if (hitEnemy.isBoss) {
        if (hitEnemy.hit()) this.handleEnemyDefeat(hitEnemy);
        return;
      }

      this.handleEnemyDefeat(hitEnemy);
    });
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
      if (!enemy.isBoss) this.spawnCoinAt(enemy);
      this.removeEnemy(enemy);
    }, dyingDuration);
  }

  spawnCoinAt(enemy) {
    let enemyArea = enemy.getCollisionArea();
    let coinX = enemyArea.x + enemyArea.width / 2 - 15;
    let coinY = enemyArea.y + enemyArea.height / 2 - 15;

    let coin = new Coins(coinX, coinY);
    this.assignWorld(coin);
    this.lvl.environmentObjects.push(coin);
  }

  removeEnemy(enemyToRemove) {
    this.lvl.enemies = this.lvl.enemies.filter(enemy => enemy !== enemyToRemove);
  }
}