class BaseWorld {
  introSkipLocked = false;
  openingIntroTriggered = false;
  openingIntroCompleted = false;
  openingIntroStartedAt = 0;
  openingIntroTimeout = null;
  openingIntroDuration = 6500;
  openingIntroTypeSpeed = 45;
  openingIntroLines = [
    'Irgendwas stimmt hier nicht!',
    'Meine Geschwister Alia und Liam',
    'sind verschwunden.',
    'Ich sollte sie suchen gehen.'
  ];
  bossIntroTriggered = false;
  bossIntroStartedAt = 0;
  bossIntroTimeout = null;
  bossIntroDuration = 5000;
  bossIntroTypeSpeed = 55;
  bossIntroLines = [
    'Arrrrr, ich bin Aliam,',
    'der Skelett-König,',
    'arrrrr!'
  ];

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
    }
  }

  skipIntroStep(lines, introType) {
    if (!this.isIntroTextFullyVisible(lines, this.getIntroStartedAt(introType), this.getIntroTypeSpeed(introType))) {
      this.setIntroToFullText(lines, introType);
      return;
    }

    if (introType === 'opening') this.finishOpeningIntro();
    if (introType === 'boss') this.finishBossIntro();
  }

  getIntroStartedAt(introType) {
    return introType === 'opening' ? this.openingIntroStartedAt : this.bossIntroStartedAt;
  }

  getIntroTypeSpeed(introType) {
    return introType === 'opening' ? this.openingIntroTypeSpeed : this.bossIntroTypeSpeed;
  }

  setIntroToFullText(lines, introType) {
    let fullCharCount = lines.join(' ').length;
    let typeSpeed = this.getIntroTypeSpeed(introType);
    let startedAt = Date.now() - fullCharCount * typeSpeed;

    if (introType === 'opening') this.openingIntroStartedAt = startedAt;
    if (introType === 'boss') this.bossIntroStartedAt = startedAt;
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
  }

  isBossIntroActive() {
    return this.isPaused && this.bossIntroTriggered;
  }

  isOpeningIntroActive() {
    return this.isPaused && this.openingIntroTriggered && !this.openingIntroCompleted;
  }

  resetKeyboard() {
    Object.keys(this.keyboard).forEach(key => {
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

    lines.forEach(line => {
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
    this.ctx.font = 'bold 20px Georgia';
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
    this.ctx.font = 'bold 20px Georgia';
    this.ctx.textBaseline = 'top';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
    this.ctx.restore();
  }
}