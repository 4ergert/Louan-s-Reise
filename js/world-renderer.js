export function drawGameOverOverlay(ctx, canvas, overlay) {
  ctx.save();
  ctx.fillStyle = overlay.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = overlay.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = overlay.lineWidth;
  ctx.strokeStyle = overlay.strokeColor;
  ctx.fillStyle = overlay.fillColor;
  ctx.strokeText(overlay.text, canvas.width / 2, canvas.height / 2);
  ctx.fillText(overlay.text, canvas.width / 2, canvas.height / 2);
  ctx.restore();
}

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
  ctx.strokeText('bossLVL1', canvas.width - 18, y - 6);
  ctx.fillText('bossLVL1', canvas.width - 18, y - 6);

  ctx.fillStyle = '#2d2118';
  ctx.fillRect(x, y, barWidth, barHeight);
  ctx.strokeStyle = '#100a07';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, barWidth, barHeight);

  ctx.fillStyle = getBossLifeBarColor(percentage);
  ctx.fillRect(x, y, barWidth * percentage, barHeight);
  ctx.restore();
}

function getBossLifeBarColor(percentage) {
  if (percentage > 0.6) return '#b33a3a';
  if (percentage > 0.3) return '#d97b2b';
  return '#e2bf4f';
}