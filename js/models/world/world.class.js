import {
  createBoneBreakAudios,
  createBossSlashingSwordAudio,
  createBossMusicAudio,
  createCoinPickupAudio,
  createEvilLaughAudio,
  createGameOverAudio,
  createMushroomPickupAudio,
  createSwordSlashingAudio,
  createThrowableObjectPickupAudio,
  createThrowingAudio,
} from '../../audio.js';
import { lvl_1 } from '../../lvl/lvl_1.js';
import { Liam } from '../Liam/liam.class.js';
import { Character } from '../character/character.class.js';
import { CoinsBar } from '../character/coins-bar.class.js';
import { LifeBar } from '../character/life-bar.class.js';
import { ThrowableObject } from '../objects/throwable-objects.class.js';
import { WorldIntros } from './world-intros.class.js';
import { worldBossEventMethods } from './world-boss-events.js';
import { worldCollisionMethods } from './world-collisions.js';
import { worldEventMethods } from './world-events.js';
import { worldIntroRenderingMethods } from './world-intro-rendering.js';
import { worldInteractionMethods } from './world-interactions.js';
import { worldLoopMethods } from './world-loop.js';
import { worldRenderingMethods } from './world-rendering.js';

/**
 * Central gameplay runtime that owns the active level state, rendering loop,
 * audio handles, combat state, pickups, and world-specific transitions.
 */
export class World extends WorldIntros {
  character = new Character();
  alia = null;
  liam = null;
  lifeBar = new LifeBar();
  coinsBar = new CoinsBar();
  throwableObjects = new ThrowableObject(10, 100, true);
  thrownBones = [];
  bossThrownSwords = [];
  lvl = lvl_1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  throwInputLocked = false;
  bloodSplatterParticles = [];
  fireflyParticles = [];
  flyingCoinPickups = [];
  flyingBonePickups = [];
  standableObjectsCache = [];
  updateStepMs = 1000 / 60;
  frameRequestId = 0;
  lastFrameTime = 0;
  accumulatedTime = 0;
  isPaused = false;
  coinPickupAudio = createCoinPickupAudio();
  bonePickupAudio = createThrowableObjectPickupAudio();
  mushroomPickupAudio = createMushroomPickupAudio();
  throwingAudio = createThrowingAudio();
  swordSlashingAudio = createSwordSlashingAudio();
  bossSlashingSwordAudio = createBossSlashingSwordAudio();
  boneBreakAudios = createBoneBreakAudios();
  bossMusicAudio = createBossMusicAudio();
  evilLaughAudio = createEvilLaughAudio();
  gameOverAudio = createGameOverAudio();
  lastBoneBreakAudioIndex = -1;
  backgroundMusicAudio = null;
  bossMusicTriggered = false;
  bossIntroLaughPlayed = false;
  liamIntroCompleted = false;
  gameOverAudioPlayed = false;
  gameOverStartedAt = 0;
  gameOverRetryDelay = 3000;
  endingEscortActive = false;
  endingEscortCameraX = 0;
  endingLiamChaseActive = false;
  endingLiamChaseStartedAt = 0;
  endingLiamChaseLines = ['Wartet auf mich'];
  endingLiamChaseTypeSpeed = 50;
  victoryOverlayVisible = false;
  victoryOverlayStartedAt = 0;
  victoryPromptDelay = 3000;

  /**
   * Creates a world instance for the provided canvas, keyboard state, and level.
   *
   * @param {HTMLCanvasElement} canvas - Canvas used for drawing the world.
  * @param {import('../keyboard.class.js').Keyboard} keyboard - Shared keyboard input state.
   * @param {HTMLAudioElement | null} [backgroundMusicAudio=null] - Background music used during gameplay.
    * @param {import('../../lvl/lvl.class.js').LVL} [lvl=lvl_1] - Initial level configuration.
   */
  constructor(canvas, keyboard, backgroundMusicAudio = null, lvl = lvl_1) {
    super();
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.backgroundMusicAudio = backgroundMusicAudio;
    this.lvl = lvl;
    this.refreshStandableObjectsCache();
    this.applyLevelWorldSettings();
    this.setWorld();
    this.spawnInitialAliaIfConfigured();
    this.startLoop();
  }

  /**
   * Returns the current boss enemy for the active level.
   *
   * @returns {any} The boss enemy when present.
   */
  get bossLVL1() {
    return this.lvl.enemies.find((enemy) => enemy.isBoss);
  }
}

Object.assign(
  World.prototype,
  worldLoopMethods,
  worldRenderingMethods,
  worldIntroRenderingMethods,
  worldCollisionMethods,
  worldInteractionMethods,
  worldBossEventMethods,
  worldEventMethods,
);
