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

  if (showRetryPrompt) {
    ctx.font = 'bold 28px Georgia';
    ctx.strokeText('Try again', canvas.width / 2, canvas.height / 2 + 72);
    ctx.fillText('Try again', canvas.width / 2, canvas.height / 2 + 72);

    ctx.font = '24px Georgia';
    ctx.strokeText('press any key', canvas.width / 2, canvas.height / 2 + 116);
    ctx.fillText('press any key', canvas.width / 2, canvas.height / 2 + 116);
  }

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