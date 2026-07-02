/**
 * @typedef {import('./character.class.js').Character} Character
 */

/**
 * Updates the character movement state for the current frame.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function charMovement(character) {
  if (gamePaused(character)) return;
  knckbackOrMove(character);
  if (allowsToJump(character)) character.vcY = 6.75;
  freezeMovement(character);
}

/**
 * Stops movement updates while the world is paused or the character is frozen.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when further movement handling should stop for this frame.
 */
export function gamePaused(character) {
  if (character.world?.isPaused) return true;

  updateSpawnOpacity(character);

  if (shouldFreezeMovement(character)) {
    freezeMovement(character);
    return true;
  }

  return false;
}

/**
 * Fades the character in during the spawn phase.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function updateSpawnOpacity(character) {
  let elapsedTime = Date.now() - character.spawnStartedAt;
  character.opacity = Math.min(1, elapsedTime / character.spawnDuration);
}

/**
 * Checks whether movement should be blocked entirely.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when the character must stay frozen.
 */
export function shouldFreezeMovement(character) {
  return isSpawning(character) || character.isDying || character.isDead;
}

/**
 * Keeps the camera aligned with the character.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function freezeMovement(character) {
  if (character.world?.endingEscortActive) {
    character.world.camera_x = character.world.endingEscortCameraX;
    return;
  }

  character.world.camera_x = -character.x + 100;
}

/**
 * Resolves either knockback or regular left/right movement.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function knckbackOrMove(character) {
  if (characterIsInKnockback(character)) knockback(character);
  else {
    if (allowsMoveRight(character)) moveRight(character);
    if (allowsMoveLeft(character)) moveLeft(character);
  }
}

/**
 * Checks whether the knockback timer is still active.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True while knockback is active.
 */
export function characterIsInKnockback(character) {
  return character.knockbackUntil > Date.now();
}

/**
 * Applies the current knockback movement.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function knockback(character) {
  character.x += character.knockbackDirection * character.knockbackSpeed;
  if (character.isAboveGround()) {
    character.vcY = 1;
    character.y -= 1;
  }
}

/**
 * Checks whether the character may move right.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when right movement is allowed.
 */
export function allowsMoveRight(character) {
  return (character.world.keyboard.RIGHT || character.world.endingEscortActive) && !character.isHurtState;
}

/**
 * Moves the character right and updates facing direction.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function moveRight(character) {
  character.x += character.speed;
  character.imgDirectionChange = false;
}

/**
 * Checks whether the character may move left.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when left movement is allowed.
 */
export function allowsMoveLeft(character) {
  return character.world.keyboard.LEFT && !character.isHurtState;
}

/**
 * Moves the character left and updates facing direction.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function moveLeft(character) {
  character.x -= character.speed;
  character.imgDirectionChange = true;
}

/**
 * Checks whether the jump input can start a jump.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when a jump may start.
 */
export function allowsToJump(character) {
  return character.world.keyboard.UP && !character.isAboveGround();
}

/**
 * Checks whether horizontal movement input is currently active.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when left or right input is pressed.
 */
export function isMoving(character) {
  return character.world.keyboard.RIGHT || character.world.keyboard.LEFT || character.world.endingEscortActive;
}

/**
 * Checks whether the character is sprinting.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True when sprint input and movement input are both active.
 */
export function isRunning(character) {
  return character.world.endingEscortActive || (character.world.keyboard.A && isMoving(character));
}

/**
 * Starts or unlocks the slash animation based on current input.
 * @param {Character} character - The active character instance.
 * @returns {void}
 */
export function updateSlashState(character) {
  if (isSpawning(character)) return;

  if (character.world.keyboard.D && !character.slashInputLocked) {
    character.slashAnimationActive = true;
    character.slashInputLocked = true;
  }

  if (!character.world.keyboard.D) character.slashInputLocked = false;
}

/**
 * Checks whether the spawn fade-in is still active.
 * @param {Character} character - The active character instance.
 * @returns {boolean} True while the character is still spawning.
 */
export function isSpawning(character) {
  return character.opacity < 1;
}