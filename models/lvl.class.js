export class LVL {
  enemies;
  platformObjects;
  solidObjects;
  environmentObjects;
  backgroundObjects;
  worldSettings;

  constructor(enemies, platformObjects, solidObjects, environmentObjects, backgroundObjects, worldSettings = {}) {
    this.enemies = enemies;
    this.platformObjects = platformObjects;
    this.solidObjects = solidObjects;
    this.environmentObjects = environmentObjects;
    this.backgroundObjects = backgroundObjects;
    this.worldSettings = worldSettings;
  }
}