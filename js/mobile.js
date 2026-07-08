import { pauseActiveMusic, playBackgroundAudio, resumePausedMusic } from './audio.js';
import { isGameCanvasVisible } from './game/canvas.js';
import { gameMenuDialogIds } from './game/config.js';
import { gameState } from './game/state.js';

let portraitPauseState = {
	active: false,
	previousWorldPause: false,
	pausedWorld: null,
	pausedMusicAudios: [],
};

/**
 * Initializes portrait-mode handling for mobile devices.
 *
 * Pauses the world while a phone-sized coarse-pointer device is held upright
 * and shows an overlay prompting the user to rotate the device.
 *
 * @returns {void}
 */
export function initMobileOrientationPause() {
	syncMobileOrientationPause();
	window.addEventListener('resize', updateMobileOrientationPause);
	window.addEventListener('orientationchange', updateMobileOrientationPause);
}

/**
 * Re-evaluates portrait-mode handling against the current world instance.
 *
 * @returns {void}
 */
export function syncMobileOrientationPause() {
	updateMobileOrientationPause();
}

/**
 * Determines whether the current device state should force portrait blocking.
 *
 * @returns {boolean}
 */
export function shouldPauseForMobilePortrait() {
	return shouldShowMobilePortraitOverlay() && isGameCanvasVisible();
}

/**
 * Returns whether portrait-mode pause is currently active.
 *
 * @returns {boolean}
 */
export function isMobilePortraitPauseActive() {
	return portraitPauseState.active || shouldPauseForMobilePortrait();
}

/**
 * Resumes a world only when portrait mode is no longer forcing a hard pause.
 *
 * @param {{ isPaused: boolean, resetKeyboard?: () => void } | null | undefined} world
 * @returns {void}
 */
export function resumeWorldIfAllowed(world) {
	if (!world) return;
	if (shouldPauseForMobilePortrait()) return activatePortraitPause();

	world.isPaused = false;
	world.resetKeyboard?.();
}

/**
 * Synchronizes portrait-mode pause state and overlay visibility.
 *
 * @returns {void}
 */
function updateMobileOrientationPause() {
	let shouldShowPortraitOverlay = shouldShowMobilePortraitOverlay();
	let shouldPauseForPortrait = shouldShowPortraitOverlay && isGameCanvasVisible();
	let overlay = document.getElementById('mobileOrientationOverlay');
	let startScreenPrompt = document.getElementById('startScreenOrientationPrompt');

	document.body.classList.toggle('mobile-portrait-active', shouldShowPortraitOverlay);

	if (overlay) overlay.setAttribute('aria-hidden', `${!shouldShowPortraitOverlay}`);
	if (startScreenPrompt) startScreenPrompt.setAttribute('aria-hidden', `${!shouldShowPortraitOverlay}`);

	if (shouldPauseForPortrait) return activatePortraitPause();

	deactivatePortraitPause();
}

/**
 * Determines whether portrait guidance should be shown on phone-sized touch devices.
 *
 * @returns {boolean}
 */
function shouldShowMobilePortraitOverlay() {
	let hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(any-pointer: coarse)').matches;
	let hasTouchInput = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
	let isPortrait = window.matchMedia('(orientation: portrait)').matches;
	let isPhoneViewport = Math.min(window.innerWidth, window.innerHeight) <= 900;

	return isPortrait && isPhoneViewport && (hasCoarsePointer || hasTouchInput);
}

/**
 * Applies the portrait pause once and remembers the prior world pause state.
 *
 * @returns {void}
 */
function activatePortraitPause() {
	let world = gameState.world;
	let isAlreadyActiveForWorld = portraitPauseState.active && portraitPauseState.pausedWorld === world;

	if (!portraitPauseState.active) {
		portraitPauseState.active = true;
		portraitPauseState.pausedMusicAudios = pauseActiveMusic();
	}

	if (!world || isAlreadyActiveForWorld) return;

	portraitPauseState.previousWorldPause = world.isPaused && !isAnyGameMenuDialogOpen();
	portraitPauseState.pausedWorld = world;
	world.isPaused = true;
	world.resetKeyboard?.();
}

/**
 * Restores the world pause state from before portrait mode became active.
 *
 * @returns {void}
 */
function deactivatePortraitPause() {
	let world = portraitPauseState.pausedWorld ?? gameState.world;

	if (!portraitPauseState.active) return;

	portraitPauseState.active = false;
	resumePausedMusic(portraitPauseState.pausedMusicAudios);
	portraitPauseState.pausedMusicAudios = [];
	portraitPauseState.pausedWorld = null;
	restoreGameplayMusic(world);
	if (!world) return;

	world.isPaused = portraitPauseState.previousWorldPause || isAnyGameMenuDialogOpen();
	world.resetKeyboard?.();
}

/**
 * Restarts the currently relevant gameplay music after portrait pause.
 *
 * @param {{ backgroundMusicAudio?: HTMLAudioElement | null, bossMusicAudio?: HTMLAudioElement | null, bossMusicTriggered?: boolean } | null | undefined} world
 * @returns {void}
 */
function restoreGameplayMusic(world) {
	if (!world || !isGameCanvasVisible()) return;

	if (world.bossMusicTriggered) {
		playBackgroundAudio(world.bossMusicAudio);
		return;
	}

	playBackgroundAudio(world.backgroundMusicAudio ?? gameState.gameBackgroundAudio);
}

/**
 * Checks whether any dialog from the in-game menu stack is currently open.
 *
 * @returns {boolean}
 */
function isAnyGameMenuDialogOpen() {
	return gameMenuDialogIds.some((dialogId) => {
		let dialog = document.getElementById(dialogId);
		return dialog instanceof HTMLDialogElement && dialog.open;
	});
}
