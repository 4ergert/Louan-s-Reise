import { isMoving, isRunning, isSpawning } from './char-movements.js';
import { playDyingAnimation, playThrowingAnimation } from './char-animation-actions.js';

/**
 * Selects and plays the appropriate character animation for the current state.
 * Prioritizes spawn, damage, attack, air, running, and walking states in that order.
 *
 * @param {import('./character.class.js').Character} character - The active character instance.
 * @returns {void}
 */
export function switchCharAnimation(character) {
  if (character.world?.isPaused) return;

  switch (true) {
    case isSpawning(character):
      character.spriteAnimation(character.IDLE);
      break;
    case character.isDying:
      playDyingAnimation(character);
      break;
    case character.isHurt():
      character.spriteAnimation(character.HURT);
      break;
    case character.throwingAnimationActive:
      playThrowingAnimation(character);
      break;
    case character.isAboveGround() && character.vcY > 3:
      character.spriteAnimation(character.JUMPING, false); // Play the jumping animation once
      break;
    case character.isAboveGround() && character.vcY < -1: // Falling down fast
      character.spriteAnimation(character.FALLING);
      break;
    case character.isAboveGround():
      character.spriteAnimation(character.FLYING); // Play the flying animation while in the air
      break;
    case isRunning(character):
      if (!character.isHurtState) {
        character.spriteAnimation(character.RUNNING);
        character.speed = 4;
      }
      break;
    case isMoving(character):
      if (!character.isHurtState) {
        character.spriteAnimation(character.WALKING);
        character.speed = 1;
      }
      break;
    default:
      character.spriteAnimation(character.IDLE);
  }
}