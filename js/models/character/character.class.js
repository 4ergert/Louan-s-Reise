import { CHARACTER_SPRITES } from '../../sprites-path/character-sprites.js';
import { createJumpEffortAudios, createRunningFootstepAudios, playRandomVariantSound } from '../../audio.js';
import { MovableObject } from '../objects/movable-object.class.js';
import { switchCharAnimation } from './switch-char-animation.js';
import { charMovement } from './char-movements.js';
import { die } from './char-animation-actions.js';

/**
 * Player-controlled hero with movement, combat, audio, and animation state.
 */
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
  animationElapsed = 0;
  animationIntervalMs = 50;
  
  IDLE = CHARACTER_SPRITES.IDLE_ANIMATION;
  IDLE_BLINKING = CHARACTER_SPRITES.IDLE_BLINKING_ANIMATION;
  WALKING = CHARACTER_SPRITES.WALKING_ANIMATION;
  RUNNING = CHARACTER_SPRITES.RUNNING_ANIMATION;
  JUMPING = CHARACTER_SPRITES.JUMPING_ANIMATION;
  FLYING = CHARACTER_SPRITES.JUMPING_LOOP_ANIMATION;
  FALLING = CHARACTER_SPRITES.FALLING_ANIMATION;
  THROWING = CHARACTER_SPRITES.THROWING_ANIMATION;
  HURT = CHARACTER_SPRITES.HURT_ANIMATION;
  DYING = CHARACTER_SPRITES.DYING_ANIMATION;

  /**
   * Creates the character, loads all sprite sets, and starts physics and animation updates.
   */
  constructor() {
    super();
    this.loadImage('./assets/img/Character/Louan/Idle/0_Dark_Oracle_Idle_000.png');
    this.loadImages(this.IDLE);
    this.loadImages(this.IDLE_BLINKING);
    this.loadImages(this.WALKING);
    this.loadImages(this.RUNNING);
    this.loadImages(this.JUMPING);
    this.loadImages(this.FLYING);
    this.loadImages(this.FALLING);
    this.loadImages(this.THROWING);
    this.loadImages(this.HURT);
    this.loadImages(this.DYING);

    this.applyGravity();
  }

  /**
   * Starts the character update loops for movement and sprite animation.
   * Runs movement at 60 FPS and updates the displayed animation frame every 50 ms.
   *
   * @returns {void}
   */
  updateStep() {
    super.updateStep();
    charMovement(this);
    this.updateAnimationStep();
  }

  /**
   * Advances the character animation state when its frame interval elapsed.
   *
   * @returns {void}
   */
  updateAnimationStep() {
    if (!this.shouldAdvanceTimedStep('animationElapsed', this.animationIntervalMs)) return;

    switchCharAnimation(this);
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
   * @returns {boolean}
   */
  isAboveGround() {
    if (this.shouldKeepFallingIntoAbyss()) return true;

    return super.isAboveGround();
  }

  /**
   * @returns {boolean}
   */
  shouldKeepFallingIntoAbyss() {
    if (this.isStandingOnPlatform()) return false;
    if (!this.world) return false;

    if (!this.hasStandableObjectBelow()) return true;

    if (!this.world.isCharacterInDeathFallZone()) return false;

    let deathY = this.world.getCharacterFallDeathY();

    if (this.isDead) {
      return this.y < deathY + this.height;
    }

    return this.y < deathY;
  }

  /**
   * @returns {boolean}
   */
  hasStandableObjectBelow() {
    let ownCollisionArea = this.getCollisionArea();
    let feet = ownCollisionArea.y + ownCollisionArea.height;

    return this.getStandableObjects().some((platform) => {
      let platformArea = platform.getCollisionArea();
      let overlapsHorizontally =
        ownCollisionArea.x + ownCollisionArea.width > platformArea.x &&
        ownCollisionArea.x < platformArea.x + platformArea.width;

      return overlapsHorizontally && platformArea.y >= feet;
    });
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
    this.resetAnimationSequence(sprites, () => {
      this.lastRunningFootstepFrame = -1;
      this.jumpEffortPlayed = false;
    });

    let i = this.showAnimationFrame(sprites, loop);

    this.playRunningFootstep(sprites, i);
    this.playJumpEffort(sprites, i);
  }

  /**
   * Plays a running footstep sound on selected running frames.
   *
   * @param {string[]} sprites
   * @param {number} frameIndex
   * @returns {void}
   */
  playRunningFootstep(sprites, frameIndex) {
    if (sprites !== this.RUNNING) return;
    if (![2, 8].includes(frameIndex)) return;
    if (this.lastRunningFootstepFrame === frameIndex) return;

    this.lastRunningFootstepIndex = playRandomVariantSound(this.runningFootstepAudios, this.lastRunningFootstepIndex);
    this.lastRunningFootstepFrame = frameIndex;
  }

  /**
   * Plays the jump effort sound once at the start of the jump animation.
   *
   * @param {string[]} sprites
   * @param {number} frameIndex
   * @returns {void}
   */
  playJumpEffort(sprites, frameIndex) {
    if (sprites !== this.JUMPING) return;
    if (frameIndex !== 0) return;
    if (this.jumpEffortPlayed) return;

    this.lastJumpEffortIndex = playRandomVariantSound(this.jumpEffortAudios, this.lastJumpEffortIndex);
    this.jumpEffortPlayed = true;
  }
}