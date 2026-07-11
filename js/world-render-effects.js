import { getSelectedLevelId } from './game/level-session.js';

/**
 * @typedef {object} GameOverOverlay
 * @property {string} background
 * @property {string} font
 * @property {number} lineWidth
 * @property {string} strokeColor
 * @property {string} fillColor
 * @property {string} text
 */

/**
 * @typedef {object} BloodParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} gravity
 * @property {number} radius
 * @property {number} startedAt
 * @property {number} duration
 * @property {number} expiresAt
 * @property {string} color
 */

/**
 * @typedef {object} FireflyParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} radius
 * @property {number} glowRadius
 * @property {number} alpha
 * @property {number} twinkleSpeed
 * @property {number} phase
 * @property {string} coreColor
 * @property {string} glowColor
 */

/**
 * @typedef {object} BossLifeSource
 * @property {number} energy
 * @property {number} maxEnergy
 */

/**
 * Draws the full-screen game over overlay text and background.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {HTMLCanvasElement} canvas - The canvas used for layout.
 * @param {boolean} showRetryPrompt - Whether the retry prompt should be visible.
 * @returns {void}
 */
export function drawGameOverOverlay(ctx, canvas, showRetryPrompt = false) {
  ctx.save();
  ctx.fillStyle = 'rgba(16, 10, 7, 0.68)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 56px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#100a07';
  ctx.fillStyle = '#d9a441';
  ctx.strokeText('GAME OVER', canvas.width / 2, canvas.height / 2);
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

  ctx.restore();
}

/**
 * Shows or hides the game-over action buttons above the game canvas.
 *
 * @param {boolean} isVisible - Whether the game-over actions should be visible.
 * @returns {void}
 */
export function syncGameOverActions(isVisible) {
  const gameOverActions = document.getElementById('gameOverActions');

  if (!(gameOverActions instanceof HTMLDivElement)) return;

  gameOverActions.hidden = !isVisible;
}

/**
 * Shows or hides the level-advance button above the game canvas.
 *
 * @param {boolean} isVisible - Whether the button should be visible.
 * @returns {void}
 */
export function syncVictoryActions(isVisible) {
  const victoryActions = document.getElementById('victoryActions');
  const victoryButton = document.getElementById('victoryFindLiamButton');
  const isLevel2 = getSelectedLevelId() === 'lvl_2';

  if (!(victoryActions instanceof HTMLDivElement)) return;

  if (victoryButton instanceof HTMLButtonElement) {
    victoryButton.textContent = isLevel2 ? 'Back to startscreen' : 'Find Liam';
    victoryButton.setAttribute('aria-label', isLevel2 ? 'Zurueck zum Startscreen' : 'Liam finden');
  }

  victoryActions.hidden = !isVisible;
}

/**
 * Draws the full-screen victory overlay text and background.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {HTMLCanvasElement} canvas - The canvas used for layout.
 * @param {boolean} showNextLevelPrompt - Whether the next-level prompt should be visible.
 * @returns {void}
 */
export function drawVictoryOverlay(ctx, canvas, showNextLevelPrompt = false) {
  let isLevel2 = getSelectedLevelId() === 'lvl_2';
  let victoryText = isLevel2
    ? 'du hast deine Geschwister gerettet'
    : 'du hast Alia gerettet!';

  ctx.save();
  ctx.fillStyle = 'rgba(16, 10, 7, 0.68)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 40px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#100a07';
  ctx.fillStyle = '#d9a441';
  ctx.strokeText('Herzlichen Glückwunsch,', canvas.width / 2, canvas.height / 2 - 24);
  ctx.fillText('Herzlichen Glückwunsch,', canvas.width / 2, canvas.height / 2 - 24);
  ctx.strokeText(victoryText, canvas.width / 2, canvas.height / 2 + 28);
  ctx.fillText(victoryText, canvas.width / 2, canvas.height / 2 + 28);

  syncVictoryActions(showNextLevelPrompt);

  ctx.restore();
}

/**
 * Updates and renders the currently active blood particles.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {number} cameraX - Horizontal camera offset.
 * @param {BloodParticle[]} particles - All tracked particles.
 * @param {number} now - Current timestamp used for expiration.
 * @returns {BloodParticle[]} The particles that are still active.
 */
export function drawBloodSplatter(ctx, cameraX, particles, now) {
  let activeParticles = particles.filter(particle => now < particle.expiresAt);

  activeParticles.forEach(particle => {
    let age = now - particle.startedAt;
    let progress = age / particle.duration;

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity;

    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - progress);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x + cameraX, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  return activeParticles;
}

/**
 * Updates and renders atmospheric firefly particles.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {number} cameraX - Horizontal camera offset.
 * @param {FireflyParticle[]} particles - All tracked fireflies.
 * @param {number} now - Current timestamp used for motion and twinkle.
 * @param {number} viewportWidth - Visible canvas width.
 * @param {number} maxY - Lower vertical bound for the firefly area.
 * @param {(minX: number, maxX: number, maxY: number) => FireflyParticle} createParticle - Factory used for respawning particles.
 * @returns {FireflyParticle[]} Updated particle collection.
 */
export function drawFireflies(ctx, cameraX, particles, now, viewportWidth, maxY, createParticle) {
  let viewportLeft = -cameraX - 120;
  let viewportRight = -cameraX + viewportWidth + 120;
  let spawnFloor = Math.max(56, maxY);

  particles.forEach((particle, index) => {
    let { nextParticle, time } = updateFireflyParticle(
      particles,
      index,
      particle,
      now,
      viewportLeft,
      viewportRight,
      spawnFloor,
      createParticle
    );

    drawFirefly(ctx, cameraX, nextParticle, time);
  });

  return particles;
}

/**
 * Advances one firefly and respawns it when it leaves the active bounds.
 * @param {FireflyParticle[]} particles - Shared particle array.
 * @param {number} index - Index of the current particle.
 * @param {FireflyParticle} particle - Current particle state.
 * @param {number} now - Current timestamp used for motion.
 * @param {number} minX - Left horizontal bound.
 * @param {number} maxX - Right horizontal bound.
 * @param {number} maxY - Lower vertical bound.
 * @param {(minX: number, maxX: number, maxY: number) => FireflyParticle} createParticle - Factory used for respawning particles.
 * @returns {{ nextParticle: FireflyParticle, time: number }} Updated particle reference and current animation time.
 */
function updateFireflyParticle(particles, index, particle, now, minX, maxX, maxY, createParticle) {
  let time = now * particle.twinkleSpeed + particle.phase;

  particle.x += particle.vx + Math.sin(time * 0.7) * 0.08;
  particle.y += particle.vy + Math.cos(time * 0.55) * 0.06;

  if (shouldRespawnFirefly(particle, minX, maxX, maxY)) {
    particles[index] = createParticle(minX, maxX, maxY);
    particle = particles[index];
    time = now * particle.twinkleSpeed + particle.phase;
  }

  return { nextParticle: particle, time };
}

function shouldRespawnFirefly(particle, minX, maxX, maxY) {
  return particle.x < minX || particle.x > maxX || particle.y < 6 || particle.y > maxY;
}

function drawFirefly(ctx, cameraX, particle, time) {
  let pulse = 0.62 + (Math.sin(time * 2.2) + 1) * 0.19;
  let drawX = particle.x + cameraX;

  ctx.save();
  ctx.globalAlpha = particle.alpha * pulse;
  ctx.fillStyle = particle.glowColor;
  ctx.beginPath();
  ctx.arc(drawX, particle.y, particle.glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = Math.min(1, 0.7 + pulse * 0.3);
  ctx.fillStyle = particle.coreColor;
  ctx.beginPath();
  ctx.arc(drawX, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the boss life bar in the top-right corner of the canvas.
 * @param {CanvasRenderingContext2D} ctx - The drawing context.
 * @param {number} cameraX - Horizontal camera offset.
 * @param {BossLifeSource} boss - The boss energy source.
 * @param {HTMLCanvasElement} canvas - The canvas used for layout.
 * @returns {void}
 */
export function drawBossLifeBar(ctx, cameraX, boss, canvas) {
  let percentage = boss.energy / boss.maxEnergy;
  let barWidth = 220;
  let barHeight = 18;
  let x = canvas.width - barWidth - 18;
  let y = 30;

  ctx.save();
  ctx.fillStyle = '#d9a441';
  ctx.strokeStyle = '#100a07';
  ctx.lineWidth = 4;
  ctx.font = 'bold 18px Georgia';
  ctx.textAlign = 'right';
  ctx.strokeText('Skeleton King', canvas.width - 18, y - 6);
  ctx.fillText('Skeleton King', canvas.width - 18, y - 6);

  ctx.fillStyle = '#2d2118';
  ctx.fillRect(x, y, barWidth, barHeight);
  ctx.strokeStyle = '#100a07';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, barWidth, barHeight);

  ctx.fillStyle = getBossLifeBarColor(percentage);
  ctx.fillRect(x, y, barWidth * percentage, barHeight);
  ctx.restore();
}

/**
 * Returns the fill color for the boss life bar based on remaining health.
 * @param {number} percentage - Remaining life as a value between 0 and 1.
 * @returns {string} The hex color for the current life threshold.
 */
function getBossLifeBarColor(percentage) {
  if (percentage > 0.6) return '#b33a3a';
  if (percentage > 0.3) return '#d97b2b';
  return '#e2bf4f';
}