import { aboutDialogTemplate, creditsDialogTemplate, datenschutzDialogTemplate, gameMenuDialogTemplate, impressumDialogTemplate, instructionsDialogTemplate, settingsDialogTemplate, startScreenControlsTemplate, startScreenMetaTemplate, startScreenTemplate } from './templates.js';

/**
 * Inserts the game menu dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderGameMenuDialog() {
	if (document.getElementById('gameMenuDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', gameMenuDialogTemplate());
}

/**
 * Inserts the instructions dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderInstructionsDialog() {
	if (document.getElementById('instructionsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', instructionsDialogTemplate());
}

/**
 * Inserts the about dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderAboutDialog() {
	if (document.getElementById('aboutDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', aboutDialogTemplate());
}

/**
 * Inserts the settings dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderSettingsDialog() {
	if (document.getElementById('settingsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', settingsDialogTemplate());
}

/**
 * Inserts the credits dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderCreditsDialog() {
	if (document.getElementById('creditsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', creditsDialogTemplate());
}

/**
 * Inserts the privacy-policy dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderDatenschutzDialog() {
	if (document.getElementById('datenschutzDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', datenschutzDialogTemplate());
}

/**
 * Inserts the imprint dialog into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderImpressumDialog() {
	if (document.getElementById('impressumDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', impressumDialogTemplate());
}

/**
 * Inserts the start-screen meta section into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderStartScreenMeta() {
	if (document.getElementById('startScreenMeta')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', startScreenMetaTemplate());
}

/**
 * Inserts the start-screen controls into the DOM when they are not present yet.
 *
 * @returns {void}
 */
export function renderStartScreenControls() {
	if (document.getElementById('startScreenControls')) return;

	const startScreenCanvas = document.getElementById('startScreenCanvas');

	if (!(startScreenCanvas instanceof HTMLCanvasElement)) return;

	startScreenCanvas.insertAdjacentHTML('beforebegin', startScreenControlsTemplate());
}

/**
 * Inserts the start-screen intro section into the DOM when it is not present yet.
 *
 * @returns {void}
 */
export function renderStartScreen() {
	if (document.getElementById('startScreen')) return;

	const startScreenCanvas = document.getElementById('startScreenCanvas');

	if (!(startScreenCanvas instanceof HTMLCanvasElement)) return;

	startScreenCanvas.insertAdjacentHTML('beforebegin', startScreenTemplate());
}
