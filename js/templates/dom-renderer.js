import { creditsDialogTemplate, datenschutzDialogTemplate, gameMenuDialogTemplate, impressumDialogTemplate, instructionsDialogTemplate, settingsDialogTemplate, startScreenControlsTemplate, startScreenMetaTemplate, startScreenTemplate } from './templates.js';

export function renderGameMenuDialog() {
	if (document.getElementById('gameMenuDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', gameMenuDialogTemplate());
}

export function renderInstructionsDialog() {
	if (document.getElementById('instructionsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', instructionsDialogTemplate());
}

export function renderSettingsDialog() {
	if (document.getElementById('settingsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', settingsDialogTemplate());
}

export function renderCreditsDialog() {
	if (document.getElementById('creditsDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', creditsDialogTemplate());
}

export function renderDatenschutzDialog() {
	if (document.getElementById('datenschutzDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', datenschutzDialogTemplate());
}

export function renderImpressumDialog() {
	if (document.getElementById('impressumDialog')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', impressumDialogTemplate());
}

export function renderStartScreenMeta() {
	if (document.getElementById('startScreenMeta')) return;

	const gameCanvasShell = document.getElementById('gameCanvasShell');

	if (!(gameCanvasShell instanceof HTMLElement)) return;

	gameCanvasShell.insertAdjacentHTML('beforebegin', startScreenMetaTemplate());
}

export function renderStartScreenControls() {
	if (document.getElementById('startScreenControls')) return;

	const startScreenCanvas = document.getElementById('startScreenCanvas');

	if (!(startScreenCanvas instanceof HTMLCanvasElement)) return;

	startScreenCanvas.insertAdjacentHTML('beforebegin', startScreenControlsTemplate());
}

export function renderStartScreen() {
	if (document.getElementById('startScreen')) return;

	const startScreenCanvas = document.getElementById('startScreenCanvas');

	if (!(startScreenCanvas instanceof HTMLCanvasElement)) return;

	startScreenCanvas.insertAdjacentHTML('beforebegin', startScreenTemplate());
}
