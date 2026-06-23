import { CHARACTER_SPRITES } from '../../js/sprites-path/character-sprites.js';
import { createJumpEffortAudios, createRunningFootstepAudios, playRandomVariantSound } from '../../js/audio.js';
import { MovableObject } from '../objects/movable-object.class.js';
import { switchCharAnimation } from './switch-char-animation.js';
import { charMovement } from './char-movements.js';
import { die } from './char-animation-actions.js';

export class Character extends MovableObject {

  x = -47;
  y = 280;
  world;
  speed = 1;
  currentAnimation = null;
  energy = 100;
  opacity = 0;
  spawnDuration = 1200;
  spawnStartedAt = Date.now();
  throwingAnimationActive = false;
  slashAnimationActive = false;
  slashInputLocked = false;
  isHurtState = false;
  isDying = false;
  isDead = false;
  hurtUntil = 0;
  knockbackUntil = 0;
  knockbackDirection = 0;
  knockbackSpeed = 0;
  runningFootstepAudios = createRunningFootstepAudios();
  jumpEffortAudios = createJumpEffortAudios();
  lastRunningFootstepIndex = -1;
  lastRunningFootstepFrame = -1;
  lastJumpEffortIndex = -1;
  jumpEffortPlayed = false;
  
  IDLE = CHARACTER_SPRITES.IDLE_ANIMATION;
  IDLE_BLINKING = CHARACTER_SPRITES.IDLE_BLINKING_ANIMATION;
  WALKING = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING = CHARACTER_SPRITES.JUMPING_ANIMATION;
  FLYING = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING = CHARACTER_SPRITES.FALLING_ANIMATION;
  THROWING = CHARACTER_SPRITES.THROWING_ANIMATION;
  SLASHING = CHARACTER_SPRITES.SLASHING_ANIMATION;
  HURT = CHARACTER_SPRITES.HURT_ANIMATION;
  DYING = CHARACTER_SPRITES.DYING_ANIMATION;

  /**
   * Creates the character, loads all sprite sets, and starts physics and animation updates.
   */
  constructor() {
    super();
    this.loadImage('./assets/img/Character/lvl_1/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE);
    this.loadImages(this.IDLE_BLINKING);
    this.loadImages(this.WALKING);
    this.loadImages(this.RUNNING);
    this.loadImages(this.JUMPING);
    this.loadImages(this.FLYING);
    this.loadImages(this.FALLING);
    this.loadImages(this.THROWING);
    this.loadImages(this.SLASHING);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);

    this.applyGravity();
    this.animation();
  }

  /**
   * Starts the character update loops for movement and sprite animation.
   * Runs movement at 60 FPS and updates the displayed animation frame every 50 ms.
   *
   * @returns {void}
   */
  animation() {
    setInterval(() => charMovement(this), 1000 / 60); // ./models/character/char-movements.js handles all movement logic, including input and knockback
    setInterval(() => switchCharAnimation(this), 50); // ./models/character/switch-char-animation.js selects the correct animation based on the character's current state and actions
  }

  /**
   * Draws the character with its current spawn or fade opacity applied.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @returns {void}
   */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    super.draw(ctx);
    ctx.restore();
  }

  /**
   * Returns the adjusted collision box used for character hit detection.
   *
   * @returns {{x: number, y: number, width: number, height: number, offsetY: number}} The active collision area.
   */
  getCollisionArea() {
    return {
      x: this.x + 45,
      y: this.y + 35,
      width: this.width - 90,
      height: this.height - 60,
      offsetY: 30,
    };
  }

  /**
   * Checks whether the character is still inside its hurt state timer.
   *
   * @returns {boolean} True while the hurt state is active.
   */
  isHurt() {
    return this.hurtUntil > Date.now();
  }

  /**
   * Applies damage to the character, updates the life bar, and triggers death or hurt state.
   *
   * @param {number} [duration=333] - How long the hurt state should remain active in milliseconds.
   * @returns {void}
   */
  hit(duration = 333) {
    this.energy = Math.max(0, this.energy - 20);
    this.world?.lifeBar.setPercentage(this.energy);

    if (this.energy === 0) {
      die(this);
      return;
    }

    this.hurtUntil = Date.now() + duration;
    this.isHurtState = true;

    setTimeout(() => this.isHurtState = false, duration + 555); // Ensure the hurt state lasts slightly longer than the animation
  }

  /**
   * Plays a sprite sequence and resets the frame index when the active animation changes.
   *
   * @param {string[]} sprites - The sprite paths for the animation sequence.
   * @param {boolean} [loop=true] - Whether the animation should loop continuously.
   * @returns {void}
   */
  spriteAnimation(sprites, loop = true) {
    if (this.currentAnimation !== sprites) {
      this.currentAnimation = sprites;
      this.currentImage = 0;
      this.lastRunningFootstepFrame = -1;
      this.jumpEffortPlayed = false;
    }

    let i = loop
      // Loop through the animation frames if loop is true, otherwise play the animation once
      ? this.currentImage % sprites.length
      // Play the animation once and stop at the last frame if loop is false
      : Math.min(this.currentImage, sprites.length - 1);
    let path = sprites[i];
    this.img = this.imgCache[path];

    this.playRunningFootstep(sprites, i);
    this.playJumpEffort(sprites, i);

    if (loop || this.currentImage < sprites.length - 1) this.currentImage++;
  }

  playRunningFootstep(sprites, frameIndex) {
    if (sprites !== this.RUNNING) return;
    if (![2, 8].includes(frameIndex)) return;
    if (this.lastRunningFootstepFrame === frameIndex) return;

    this.lastRunningFootstepIndex = playRandomVariantSound(this.runningFootstepAudios, this.lastRunningFootstepIndex);
    this.lastRunningFootstepFrame = frameIndex;
  }

  playJumpEffort(sprites, frameIndex) {
    if (sprites !== this.JUMPING) return;
    if (frameIndex !== 0) return;
    if (this.jumpEffortPlayed) return;

    this.lastJumpEffortIndex = playRandomVariantSound(this.jumpEffortAudios, this.lastJumpEffortIndex);
    this.jumpEffortPlayed = true;
  }
}