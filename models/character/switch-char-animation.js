export function switchCharAnimation(character) {
  if (character.world?.isPaused) return;

  character.updateSlashState();

  switch (true) {
    case character.isSpawning():
      character.spriteAnimation(character.IDLE);
      break;
    case character.isDying:
      character.playDyingAnimation();
      break;
    case character.isHurt():
      character.spriteAnimation(character.HURT);
      break;
    case character.throwingAnimationActive:
      character.playThrowingAnimation();
      break;
    case character.slashAnimationActive:
      character.playSlashAnimation();
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
    case character.isRunning():
      if (!character.isHurtState) {
        character.spriteAnimation(character.RUNNING);
        character.speed = 4;
      }
      break;
    case character.isMoving():
      if (!character.isHurtState) {
        character.spriteAnimation(character.WALKING);
        character.speed = 2;
      }
      break;
    default:
      character.spriteAnimation(character.IDLE);
  }
}