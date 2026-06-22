import { CHARACTER_SPRITES } from '../js/sprites-path/character-sprites.js';

export class StartScreen {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.framePaths = CHARACTER_SPRITES.IDLE_BLINKING_ANIMATION;
		this.frames = [];
		this.frameIndex = 0;
		this.frameDelay = 140;
		this.lastFrameSwitch = 0;
		this.animationId = 0;
		this.characterWidth = 180;
		this.characterHeight = 180;
		this.isReady = false;
		this.pendingStart = false;
		this.isTransitioning = false;
		this.transitionStartedAt = 0;
		this.transitionDuration = 900;
		this.onTransitionComplete = null;
		this.loadFrames();
		this.animate = this.animate.bind(this);
	}

	loadFrames() {
		let loadedFrames = 0;

		this.frames = this.framePaths.map((path) => {
			const image = new Image();
			image.onload = () => {
				loadedFrames++;
				if (loadedFrames === this.framePaths.length) {
					this.isReady = true;
					if (this.pendingStart) this.start();
				}
			};
			image.src = path;
			return image;
		});
	}

	start() {
		if (!this.isReady) {
			this.pendingStart = true;
			return;
		}

		this.pendingStart = false;
		cancelAnimationFrame(this.animationId);
		this.animationId = requestAnimationFrame(this.animate);
	}

	stop() {
		cancelAnimationFrame(this.animationId);
	}

	beginTransition(onComplete) {
		if (this.isTransitioning) return;
		this.isTransitioning = true;
		this.transitionStartedAt = 0;
		this.onTransitionComplete = onComplete;
	}

	animate(timestamp) {
		if (this.isTransitioning && !this.transitionStartedAt) {
			this.transitionStartedAt = timestamp;
		}

		if (timestamp - this.lastFrameSwitch >= this.frameDelay) {
			this.frameIndex = (this.frameIndex + 1) % this.frames.length;
			this.lastFrameSwitch = timestamp;
		}

		this.drawScene(timestamp);

		if (this.isTransitioning) {
			const progress = this.getTransitionProgress(timestamp);
			if (progress >= 1) {
				this.isTransitioning = false;
				this.onTransitionComplete?.();
				return;
			}
		}

		this.animationId = requestAnimationFrame(this.animate);
	}

	getTransitionProgress(timestamp) {
		if (!this.isTransitioning || !this.transitionStartedAt) return 0;
		return Math.min((timestamp - this.transitionStartedAt) / this.transitionDuration, 1);
	}

	drawScene(timestamp) {
		const ctx = this.ctx;
		const characterX = -40;
		const baseY = -20;
		const breathingOffset = Math.sin(timestamp / 320) * 4;
		const transitionProgress = this.getTransitionProgress(timestamp);
		const flickerStrength = 1 + transitionProgress * 2.4;
		const flicker = ((Math.sin(timestamp / 85) + Math.sin(timestamp / 130)) * 0.5) * flickerStrength;
		const emberPulse = Math.min(((Math.sin(timestamp / 260) + 1) / 2) + transitionProgress * 0.45, 1.5);
		const currentFrame = this.frames[this.frameIndex];

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.fillStyle = 'rgba(0, 0, 0, 0)';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
		ctx.beginPath();
    // Ellipse parameters: centerX, centerY, radiusX, radiusY, rotation, startAngle, endAngle
		ctx.ellipse(characterX + 87, 150, 32, 12, 0, 0, Math.PI * 2);
		ctx.fill();

		if (currentFrame?.complete) {
			ctx.drawImage(
				currentFrame,
				characterX,
				baseY + breathingOffset,
				this.characterWidth,
				this.characterHeight
			);
		}

		ctx.save();
		ctx.font = 'bold 32px Cinzel Decorative';
		ctx.textBaseline = 'top';

		const lineOneGradient = ctx.createLinearGradient(0, 50, 0, 90);
		lineOneGradient.addColorStop(0, '#fff7cf');
		lineOneGradient.addColorStop(0.45, '#ffd36b');
		lineOneGradient.addColorStop(1, '#ff7a1a');

		const lineTwoGradient = ctx.createLinearGradient(0, 100, 0, 140);
		lineTwoGradient.addColorStop(0, '#fff7cf');
		lineTwoGradient.addColorStop(0.45, '#ffd36b');
		lineTwoGradient.addColorStop(1, '#ff7a1a');

		ctx.shadowColor = `rgba(255, 82, 0, ${0.45 + emberPulse * 0.25})`;
		ctx.shadowBlur = 14 + emberPulse * 12;
		ctx.shadowOffsetX = 1 + flicker * 1.5;
		ctx.shadowOffsetY = 3 + emberPulse * 2;
		ctx.fillStyle = 'rgba(160, 32, 0, 0.6)';
		ctx.fillText('Druecke Leertaste,', 212, 54);
		ctx.fillText('um Louans Reise zu beginnen.', 122, 104);

		ctx.shadowColor = `rgba(255, 170, 40, ${0.55 + emberPulse * 0.25})`;
		ctx.shadowBlur = 22 + emberPulse * 16;
		ctx.shadowOffsetX = flicker * 2;
		ctx.shadowOffsetY = 0;
		ctx.fillStyle = lineOneGradient;
		ctx.fillText('Druecke Leertaste,', 210, 50);
		ctx.fillStyle = lineTwoGradient;
		ctx.fillText('um Louans Reise zu beginnen.', 120, 100);

		ctx.shadowColor = 'rgba(255, 250, 220, 0.35)';
		ctx.shadowBlur = 6;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.fillStyle = '#fff7de';
		ctx.fillText('Druecke Leertaste,', 210, 50);
		ctx.fillText('um Louans Reise zu beginnen.', 120, 100);

		ctx.restore();
	}
}