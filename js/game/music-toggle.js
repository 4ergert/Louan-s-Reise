import { getMusicMuted, setMusicMuted } from '../audio.js';

/**
 * Initializes all music toggle buttons on the page and syncs their UI state.
 *
 * @returns {void}
 */
export function initMusicToggle() {
  const musicToggleButtons = document.querySelectorAll('[data-music-toggle], #musicToggleButton');

  if (!musicToggleButtons.length) return;

  const renderButtonState = () => {
    const isMuted = getMusicMuted();
    musicToggleButtons.forEach((button) => renderMusicToggleButton(button, isMuted));
  };

  renderButtonState();
  musicToggleButtons.forEach((button) => initMusicToggleButton(button, renderButtonState));
}

/**
 * Renders the current mute state into a music toggle button.
 *
 * @param {Element} button - Candidate button element to update.
 * @param {boolean} isMuted - Whether music playback is currently muted.
 * @returns {void}
 */
function renderMusicToggleButton(button, isMuted) {
  if (!(button instanceof HTMLButtonElement)) return;

  const buttonLabel = button.dataset.musicToggleLabel;

  if (buttonLabel) {
    button.textContent = isMuted ? `${buttonLabel} einschalten` : `${buttonLabel} stummschalten`;
    button.setAttribute('aria-pressed', `${isMuted}`);
    button.setAttribute('aria-label', isMuted ? 'Musik einschalten' : 'Musik stummschalten');
    button.dataset.muted = `${isMuted}`;
    return;
  }

  button.textContent = '♪';
  button.setAttribute('aria-pressed', `${isMuted}`);
  button.setAttribute('aria-label', isMuted ? 'Musik einschalten' : 'Musik stummschalten');
  button.dataset.muted = `${isMuted}`;
}

/**
 * Registers the click handler for a music toggle button.
 *
 * @param {Element} button - Candidate button element to wire up.
 * @param {() => void} renderButtonState - Re-renders the shared mute button state after toggling.
 * @returns {void}
 */
function initMusicToggleButton(button, renderButtonState) {
  if (!(button instanceof HTMLButtonElement)) return;

  button.addEventListener('click', () => {
    setMusicMuted(!getMusicMuted());
    renderButtonState();
  });
}