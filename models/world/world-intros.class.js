export class WorldIntros {
  introSkipLocked = false;
  openingIntroTriggered = false;
  openingIntroCompleted = false;
  openingIntroStartedAt = 0;
  openingIntroTimeout = null;
  openingIntroDuration = 6500;
  openingIntroTypeSpeed = 45;
  openingIntroLines = [];

  bossIntroTriggered = false;
  bossIntroStartedAt = 0;
  bossIntroTimeout = null;
  bossIntroDuration = 5000;
  bossIntroTypeSpeed = 55;
  bossIntroLines = [];

  aliaIntroTriggered = false;
  aliaIntroCompleted = false;
  aliaIntroStartedAt = 0;
  aliaIntroTimeout = null;
  aliaIntroDuration = 7000;
  aliaIntroTypeSpeed = 45;
  aliaIntroLines = [];

  characterResponseIntroTriggered = false;
  characterResponseIntroStartedAt = 0;
  characterResponseIntroTimeout = null;
  characterResponseIntroDuration = 5000;
  characterResponseIntroTypeSpeed = 45;
  characterResponseIntroLines = [];

  handleIntroSkip() {
    if (!this.keyboard.SPACE) {
      this.introSkipLocked = false;
      return;
    }

    if (this.introSkipLocked) return;
    this.introSkipLocked = true;

    if (this.isOpeningIntroActive()) {
      this.skipIntroStep(this.openingIntroLines, 'opening');
      return;
    }

    if (this.isBossIntroActive()) {
      this.skipIntroStep(this.bossIntroLines, 'boss');
      return;
    }

    if (this.isAliaIntroActive()) {
      this.skipIntroStep(this.aliaIntroLines, 'alia');
      return;
    }

    if (this.isCharacterResponseIntroActive()) {
      this.skipIntroStep(this.characterResponseIntroLines, 'characterResponse');
    }
  }

  skipIntroStep(lines, introType) {
    if (!this.isIntroTextFullyVisible(lines, this.getIntroStartedAt(introType), this.getIntroTypeSpeed(introType))) {
      this.setIntroToFullText(lines, introType);
      return;
    }

    if (introType === 'opening') this.finishOpeningIntro();
    if (introType === 'boss') this.finishBossIntro();
    if (introType === 'alia') this.finishAliaIntro();
    if (introType === 'characterResponse') this.finishCharacterResponseIntro();
  }

  getIntroStartedAt(introType) {
    if (introType === 'opening') return this.openingIntroStartedAt;
    if (introType === 'boss') return this.bossIntroStartedAt;
    if (introType === 'alia') return this.aliaIntroStartedAt;
    return this.characterResponseIntroStartedAt;
  }

  getIntroTypeSpeed(introType) {
    if (introType === 'opening') return this.openingIntroTypeSpeed;
    if (introType === 'boss') return this.bossIntroTypeSpeed;
    if (introType === 'alia') return this.aliaIntroTypeSpeed;
    return this.characterResponseIntroTypeSpeed;
  }

  setIntroToFullText(lines, introType) {
    let fullCharCount = lines.join(' ').length;
    let typeSpeed = this.getIntroTypeSpeed(introType);
    let startedAt = Date.now() - fullCharCount * typeSpeed;

    if (introType === 'opening') this.openingIntroStartedAt = startedAt;
    if (introType === 'boss') this.bossIntroStartedAt = startedAt;
    if (introType === 'alia') this.aliaIntroStartedAt = startedAt;
    if (introType === 'characterResponse') this.characterResponseIntroStartedAt = startedAt;
  }

  isIntroTextFullyVisible(lines, startedAt, typeSpeed) {
    let elapsedTime = Date.now() - startedAt;
    let visibleChars = Math.floor(elapsedTime / typeSpeed);
    return visibleChars >= lines.join(' ').length;
  }

  finishOpeningIntro() {
    if (this.openingIntroTimeout) clearTimeout(this.openingIntroTimeout);
    this.openingIntroTimeout = null;
    this.isPaused = false;
    this.openingIntroCompleted = true;
  }

  finishBossIntro() {
    if (this.bossIntroTimeout) clearTimeout(this.bossIntroTimeout);
    this.bossIntroTimeout = null;
    this.isPaused = false;
    this.onBossIntroFinished?.();
  }

  finishAliaIntro() {
    if (this.aliaIntroTimeout) clearTimeout(this.aliaIntroTimeout);
    this.aliaIntroTimeout = null;
    this.aliaIntroTriggered = false;

    if (this.characterResponseIntroLines.length) {
      this.startCharacterResponseIntro();
      return;
    }

    this.isPaused = false;
  }

  startCharacterResponseIntro() {
    if (this.characterResponseIntroTriggered) return;

    this.characterResponseIntroTriggered = true;
    this.isPaused = true;
    this.characterResponseIntroStartedAt = Date.now();
    this.resetKeyboard();

    this.characterResponseIntroTimeout = setTimeout(() => {
      this.finishCharacterResponseIntro();
    }, this.characterResponseIntroDuration);
  }

  finishCharacterResponseIntro() {
    if (this.characterResponseIntroTimeout) clearTimeout(this.characterResponseIntroTimeout);
    this.characterResponseIntroTimeout = null;
    this.characterResponseIntroTriggered = false;
    this.isPaused = false;
    this.startEndingEscort?.();
  }

  isBossIntroActive() {
    return this.isPaused && this.bossIntroTriggered && !!this.bossLVL1;
  }

  isOpeningIntroActive() {
    return this.isPaused && this.openingIntroTriggered && !this.openingIntroCompleted;
  }

  isAliaIntroActive() {
    return this.isPaused && this.aliaIntroTriggered;
  }

  isCharacterResponseIntroActive() {
    return this.isPaused && this.characterResponseIntroTriggered;
  }

  resetKeyboard() {
    Object.keys(this.keyboard).forEach((key) => {
      this.keyboard[key] = false;
    });
  }

  applyLevelWorldSettings() {
    if (!this.lvl || !this.lvl.worldSettings) return;

    Object.assign(this, this.lvl.worldSettings);
  }

  getVisibleIntroLines(lines, startedAt, typeSpeed) {
    let elapsedTime = Date.now() - startedAt;
    let visibleChars = Math.floor(elapsedTime / typeSpeed);
    let fullText = lines.join(' ');
    let visibleText = fullText.slice(0, visibleChars);
    let visibleLines = [];
    let currentIndex = 0;

    lines.forEach((line) => {
      let lineText = visibleText.slice(currentIndex, currentIndex + line.length);
      visibleLines.push(lineText);
      currentIndex += line.length + 1;
    });

    return visibleLines;
  }

  drawBossIntroBubble() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 300, bossScreenX + 50));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(this.bossIntroLines, this.bossIntroStartedAt, this.bossIntroTypeSpeed);

    this.ctx.save();
    this.ctx.fillStyle = '#fff8ea';
    this.ctx.strokeStyle = '#3a2412';
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(bubbleX, bubbleY, 333, 110);
    this.ctx.strokeRect(bubbleX, bubbleY, 333, 110);

    this.ctx.beginPath();
    this.ctx.moveTo(bubbleX + 56, bubbleY + 110);
    this.ctx.lineTo(bubbleX + 86, bubbleY + 110);
    this.ctx.lineTo(bubbleX + 97, bubbleY + 138);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#3a2412';
    this.ctx.font = 'bold 20px Cinzel Decorative';
    this.ctx.textBaseline = 'top';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
    this.ctx.restore();
  }

  drawOpeningIntroBubble() {
    let bubbleX = 180;
    let bubbleY = 30;
    let textLines = this.getVisibleIntroLines(this.openingIntroLines, this.openingIntroStartedAt, this.openingIntroTypeSpeed);

    this.ctx.save();
    this.ctx.fillStyle = '#fff8ea';
    this.ctx.strokeStyle = '#3a2412';
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(bubbleX, bubbleY, 380, 148);
    this.ctx.strokeRect(bubbleX, bubbleY, 380, 148);

    this.ctx.beginPath();
    this.ctx.moveTo(bubbleX + 70, bubbleY + 148);
    this.ctx.lineTo(bubbleX + 110, bubbleY + 148);
    this.ctx.lineTo(bubbleX + 60, bubbleY + 180);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#3a2412';
    this.ctx.font = 'bold 16px Cinzel Decorative';
    this.ctx.textBaseline = 'top';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
    this.ctx.restore();
  }

  drawAliaIntroBubble() {
    if (!this.alia) return;

    let aliaScreenX = this.alia.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 430, aliaScreenX - 70));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(this.aliaIntroLines, this.aliaIntroStartedAt, this.aliaIntroTypeSpeed);

    this.ctx.save();
    this.ctx.fillStyle = '#fff8ea';
    this.ctx.strokeStyle = '#3a2412';
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(bubbleX, bubbleY, 430, 140);
    this.ctx.strokeRect(bubbleX, bubbleY, 430, 140);

    this.ctx.beginPath();
    this.ctx.moveTo(bubbleX + 80, bubbleY + 140);
    this.ctx.lineTo(bubbleX + 115, bubbleY + 140);
    this.ctx.lineTo(bubbleX + 96, bubbleY + 176);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#3a2412';
    this.ctx.font = 'bold 16px Cinzel Decorative';
    this.ctx.textBaseline = 'top';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
    this.ctx.restore();
  }

  drawCharacterResponseIntroBubble() {
    let characterScreenX = this.character.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 430, characterScreenX - 70));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(
      this.characterResponseIntroLines,
      this.characterResponseIntroStartedAt,
      this.characterResponseIntroTypeSpeed
    );

    this.ctx.save();
    this.ctx.fillStyle = '#fff8ea';
    this.ctx.strokeStyle = '#3a2412';
    this.ctx.lineWidth = 4;
    this.ctx.fillRect(bubbleX, bubbleY, 430, 110);
    this.ctx.strokeRect(bubbleX, bubbleY, 430, 110);

    this.ctx.beginPath();
    this.ctx.moveTo(bubbleX + 70, bubbleY + 110);
    this.ctx.lineTo(bubbleX + 105, bubbleY + 110);
    this.ctx.lineTo(bubbleX + 74, bubbleY + 146);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#3a2412';
    this.ctx.font = 'bold 16px Cinzel Decorative';
    this.ctx.textBaseline = 'top';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
    this.ctx.restore();
  }
}