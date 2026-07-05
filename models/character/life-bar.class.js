import { DrawableObject } from '../objects/drawable-objects.class.js';

/**
 * HUD element that displays the player's life as segmented bars with a blink effect.
 */
export class LifeBar extends DrawableObject {
  imgLife ='./assets/img/Collectable Object/Autumn_Forest_2D_Platformer_Tileset_Collectable Object - Life.png';
  percentage = 100;
  maxSegments = 5;
  segmentBlinkUntil = 0;
  blinkCycleDuration = 180;
  blinkCycles = 3;

  /**
   * Creates the life icon and positions the life bar on the HUD.
   */
  constructor() {
    super();
    this.loadImage(this.imgLife);
    this.x = 16;
    this.y = 16;
    this.width = 40;
    this.height = 40;
  }

  /**
   * Draws the life icon and the segmented life indicator.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering context used for HUD drawing.
   */
  draw(ctx) {
    super.draw(ctx);
    this.drawLifeSegments(ctx);
  }

  /**
   * Draws the segmented life display next to the life icon.
   *
   * @param {CanvasRenderingContext2D} ctx Rendering context used for segment drawing.
   */
  drawLifeSegments(ctx) {
    let filledSegments = Math.ceil((this.percentage / 100) * this.maxSegments);
    let segmentWidth = 8;
    let segmentHeight = 24;
    let gap = 6;
    let startX = this.x + this.width + 12;
    let startY = this.y + (this.height - segmentHeight) / 2;
    let isBlinking = this.isSegmentBlinkActive();
    let blinkVisible = !isBlinking || this.isBlinkFrameVisible();

    for (let i = 0; i < this.maxSegments; i++) {
      ctx.fillStyle = this.getSegmentFillColor(i, filledSegments, blinkVisible);
      ctx.fillRect(startX + i * (segmentWidth + gap), startY, segmentWidth, segmentHeight);

      ctx.strokeStyle = '#1f140d';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX + i * (segmentWidth + gap), startY, segmentWidth, segmentHeight);
    }
  }

  /**
   * Returns the base segment color for the current health range.
   *
   * @returns {string} Fill color for active life segments.
   */
  getSegmentColor() {
    if (this.percentage > 90) return '#47b36b';
    if (this.percentage > 30) return '#d9a441';
    return '#c84c3b';
  }

  /**
   * Returns the actual fill color for a single segment, including blink behavior.
   *
   * @param {number} index Segment index being drawn.
   * @param {number} filledSegments Number of active life segments.
   * @param {boolean} blinkVisible Whether the blink frame should currently show active color.
   * @returns {string} Fill color for the segment.
   */
  getSegmentFillColor(index, filledSegments, blinkVisible) {
    if (!blinkVisible) return '#f7f0a1';
    return index < filledSegments ? this.getSegmentColor() : '#5b4b39';
  }

  /**
   * Checks whether the damage blink effect is currently active.
   *
   * @returns {boolean} `true` when the segment blink timer has not expired yet.
   */
  isSegmentBlinkActive() {
    return this.segmentBlinkUntil > Date.now();
  }

  /**
   * Determines whether the current blink frame should be visible.
   *
   * @returns {boolean} `true` when the current blink phase should render active segments.
   */
  isBlinkFrameVisible() {
    let remainingDuration = this.segmentBlinkUntil - Date.now();
    let elapsedDuration = this.blinkCycles * this.blinkCycleDuration * 2 - remainingDuration;
    let blinkFrame = Math.floor(elapsedDuration / this.blinkCycleDuration);

    return blinkFrame % 2 === 0;
  }

  /**
   * Starts the temporary blink effect used to emphasize recent life loss.
   */
  triggerSegmentBlink() {
    this.segmentBlinkUntil = Date.now() + this.blinkCycles * this.blinkCycleDuration * 2;
  }

  /**
   * Clamps and stores the displayed life percentage.
   *
   * @param {number} percentage New life percentage.
   */
  setPercentage(percentage) {
    this.percentage = Math.max(0, Math.min(100, percentage));
  }
}