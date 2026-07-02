import { isCharacterWithinBossSlashRange } from '../../js/colliding-objects.js';

export const worldLoopMethods = {
  setWorld() {
    this.assignWorld(this.character);
    this.assignWorld(this.throwableObjects);
    this.assignWorldToAll(this.lvl.enemies);
    this.assignWorldToAll(this.lvl.environmentObjects);
  },

  isCharacterWithinBossSlashRange() {
    return isCharacterWithinBossSlashRange.call(this);
  },

  assignWorld(drawableObject) {
    if (drawableObject) drawableObject.world = this;
  },

  assignWorldToAll(drawableObjects) {
    drawableObjects.forEach((drawableObject) => this.assignWorld(drawableObject));
  },

  startLoop() {
    this.frameRequestId = requestAnimationFrame((timestamp) => this.runFrame(timestamp));
  },

  runFrame(timestamp) {
    if (!this.lastFrameTime) this.lastFrameTime = timestamp;

    const delta = Math.min(timestamp - this.lastFrameTime, 100);
    this.lastFrameTime = timestamp;
    this.accumulatedTime += delta;
    this.updateFrameState();

    while (this.accumulatedTime >= this.updateStepMs) {
      this.updateStep();
      this.accumulatedTime -= this.updateStepMs;
    }

    this.draw();
    this.frameRequestId = requestAnimationFrame((nextTimestamp) => this.runFrame(nextTimestamp));
  },

  updateFrameState() {
    this.updateOpeningIntro();
    this.updateBossIntro();
    this.handleIntroSkip();
  },

  updateStep() {
    this.updateObjects();
    this.updateCollisions();
  },

  updateObjects() {
    this.character.updateStep();
    this.alia?.updateStep();
    this.throwableObjects.updateStep();
    this.updateObjectGroup(this.lvl.enemies);
    this.updateObjectGroup(this.lvl.environmentObjects);
    this.updateObjectGroup(this.thrownBones);
    this.updateObjectGroup(this.bossThrownSwords);
  },

  updateObjectGroup(objects) {
    objects.forEach((object) => object.updateStep?.());
  },
};
