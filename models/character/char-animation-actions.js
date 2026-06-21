/**
 * Starts knockback and sets its direction based on the incoming source position.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @param {?number} [sourceX=null] - The x position of the impact source.
 * @param {number} [duration=333] - How long the knockback stays active in milliseconds.
 * @param {number} [speed=5] - The horizontal knockback speed.
 * @returns {void}
 */
export function startKnockback(character, sourceX = null, duration = 333, speed = 5) {
  character.knockbackUntil = Date.now() + duration;
  character.knockbackSpeed = speed;
  if (sourceX === null) {
    character.knockbackDirection = character.imgDirectionChange ? 1 : -1;
    return;
  }

  let characterCenterX = character.x + character.width / 2;
  character.knockbackDirection = sourceX < characterCenterX ? 1 : -1;
}

/**
 * Activates the throwing animation unless the character is already dying or dead.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function startThrowingAnimation(character) {
  if (character.isDying || character.isDead) return;

  character.throwingAnimationActive = true;
}

/**
 * Switches the character into its dying state and clears active combat animation states.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function die(character) {
  if (character.isDying || character.isDead) return;

  character.isDying = true;
  character.isHurtState = false;
  character.throwingAnimationActive = false;
  character.slashAnimationActive = false;
  character.knockbackUntil = 0;
  character.currentAnimation = null;
  character.currentImage = 0;
}

/**
 * Plays the one-shot throwing animation and clears the active state at the last frame.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function playThrowingAnimation(character) {
  character.spriteAnimation(character.THROWING, false);

  if (character.currentAnimation === character.THROWING && character.currentImage >= character.THROWING.length - 1) {
    character.throwingAnimationActive = false;
  }
}

/**
 * Plays the one-shot slash animation and clears the active state at the last frame.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function playSlashAnimation(character) {
  character.spriteAnimation(character.SLASHING, false);

  if (character.currentAnimation === character.SLASHING && character.currentImage >= character.SLASHING.length - 1) {
    character.slashAnimationActive = false;
  }
}

/**
 * Plays the one-shot dying animation and marks the character as dead at the last frame.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function playDyingAnimation(character) {
  character.spriteAnimation(character.DYING, false);

  if (character.currentAnimation === character.DYING && character.currentImage >= character.DYING.length - 1) {
    character.isDead = true;
  }
}