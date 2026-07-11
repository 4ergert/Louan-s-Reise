/**
 * @typedef {Object} IntroBubbleConfig
 * @property {number} bubbleX
 * @property {number} bubbleY
 * @property {number} width
 * @property {number} height
 * @property {Array<[number, number]>} tailPoints
 * @property {string} font
 * @property {string[]} textLines
 */

/**
 * World methods responsible for typewriter intro text rendering and speech bubbles.
 */
export const worldIntroRenderingMethods = {
  /**
   * Returns the currently visible portion of intro text split into its original lines.
   *
   * @param {string[]} lines
   * @param {number} startedAt
   * @param {number} typeSpeed
   * @returns {string[]}
   */
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
  },

  /**
   * Draws a configured speech bubble and its text.
   *
   * @param {IntroBubbleConfig} config
   * @returns {void}
   */
  drawIntroBubble({ bubbleX, bubbleY, width, height, tailPoints, font, textLines }) {
    this.ctx.save();
    this.configureBubbleContext(font);
    this.drawBubbleBody(bubbleX, bubbleY, width, height);
    this.drawBubbleTail(tailPoints);
    this.drawBubbleText(textLines, bubbleX, bubbleY);
    this.ctx.restore();
  },

  /**
   * Applies the shared canvas styles used by intro bubbles.
   *
   * @param {string} font
   * @returns {void}
   */
  configureBubbleContext(font) {
    this.ctx.fillStyle = '#fff8ea';
    this.ctx.strokeStyle = '#3a2412';
    this.ctx.lineWidth = 4;
    this.ctx.font = font;
    this.ctx.textBaseline = 'top';
  },

  /**
   * @param {number} bubbleX
   * @param {number} bubbleY
   * @param {number} width
   * @param {number} height
   * @returns {void}
   */
  drawBubbleBody(bubbleX, bubbleY, width, height) {
    this.ctx.fillRect(bubbleX, bubbleY, width, height);
    this.ctx.strokeRect(bubbleX, bubbleY, width, height);
  },

  /**
   * @param {Array<[number, number]>} tailPoints
   * @returns {void}
   */
  drawBubbleTail(tailPoints) {
    this.ctx.beginPath();
    tailPoints.forEach(([x, y], index) => {
      if (index === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    });
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  },

  /**
   * @param {string[]} textLines
   * @param {number} bubbleX
   * @param {number} bubbleY
   * @returns {void}
   */
  drawBubbleText(textLines, bubbleX, bubbleY) {
    this.ctx.fillStyle = '#3a2412';
    textLines.forEach((line, index) => {
      this.ctx.fillText(line, bubbleX + 18, bubbleY + 16 + index * 28);
    });
  },

  /**
   * Draws the boss intro speech bubble.
   *
   * @returns {void}
   */
  drawBossIntroBubble() {
    let bossScreenX = this.bossLVL1.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 300, bossScreenX + 50));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(this.bossIntroLines, this.bossIntroStartedAt, this.bossIntroTypeSpeed);

    this.drawIntroBubble({
      bubbleX,
      bubbleY,
      width: 333,
      height: 110,
      tailPoints: [
        [bubbleX + 56, bubbleY + 110],
        [bubbleX + 86, bubbleY + 110],
        [bubbleX + 97, bubbleY + 138],
      ],
      font: 'bold 20px Cinzel Decorative',
      textLines,
    });
  },

  /**
   * Draws the opening intro speech bubble.
   *
   * @returns {void}
   */
  drawOpeningIntroBubble() {
    let bubbleX = 180;
    let bubbleY = 30;
    let textLines = this.getVisibleIntroLines(this.openingIntroLines, this.openingIntroStartedAt, this.openingIntroTypeSpeed);

    this.drawIntroBubble({
      bubbleX,
      bubbleY,
      width: 380,
      height: 148,
      tailPoints: [
        [bubbleX + 70, bubbleY + 148],
        [bubbleX + 110, bubbleY + 148],
        [bubbleX + 60, bubbleY + 180],
      ],
      font: 'bold 16px Cinzel Decorative',
      textLines,
    });
  },

  /**
   * Draws the Alia intro speech bubble.
   *
   * @returns {void}
   */
  drawAliaIntroBubble() {
    let companion = this.liam ?? this.alia;

    if (!companion) return;

    let companionScreenX = companion.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 430, companionScreenX - 70));
    let bubbleY = 35;
    let introLines = this.liam && this.LiamIntroLines?.length
      ? this.LiamIntroLines
      : this.aliaIntroLines;
    let textLines = this.getVisibleIntroLines(introLines, this.aliaIntroStartedAt, this.aliaIntroTypeSpeed);

    this.drawIntroBubble({
      bubbleX,
      bubbleY,
      width: 430,
      height: 140,
      tailPoints: [
        [bubbleX + 80, bubbleY + 140],
        [bubbleX + 115, bubbleY + 140],
        [bubbleX + 96, bubbleY + 176],
      ],
      font: 'bold 16px Cinzel Decorative',
      textLines,
    });
  },

  /**
   * Draws the character response intro speech bubble.
   *
   * @returns {void}
   */
  drawCharacterResponseIntroBubble() {
    let characterScreenX = this.character.x + this.camera_x;
    let bubbleX = Math.max(20, Math.min(this.canvas.width - 430, characterScreenX - 70));
    let bubbleY = 35;
    let textLines = this.getVisibleIntroLines(
      this.characterResponseIntroLines,
      this.characterResponseIntroStartedAt,
      this.characterResponseIntroTypeSpeed
    );

    this.drawIntroBubble({
      bubbleX,
      bubbleY,
      width: 430,
      height: 110,
      tailPoints: [
        [bubbleX + 70, bubbleY + 110],
        [bubbleX + 105, bubbleY + 110],
        [bubbleX + 74, bubbleY + 146],
      ],
      font: 'bold 16px Cinzel Decorative',
      textLines,
    });
  },
};