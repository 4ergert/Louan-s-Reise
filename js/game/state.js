import { Keyboard } from '../models/keyboard.class.js';
import { createGameBackgroundAudio } from '../audio.js';
import { getSelectedLevelId } from './level-session.js';

/**
 * @typedef {object} GameState
 * @property {HTMLCanvasElement | null} canvas - Active gameplay canvas element.
 * @property {import('../models/world/world.class.js').World | null} world - Active world instance once gameplay has started.
 * @property {Keyboard} keyboard - Shared keyboard input state used by the world.
 * @property {import('../models/start-screen-class.js').StartScreen | null} startScreen - Animated start-screen controller.
 * @property {HTMLAudioElement} gameBackgroundAudio - Background music instance for active gameplay.
 * @property {boolean} isIntroVisible - Whether the intro prompt is currently visible.
 * @property {boolean} isStartScreenVisible - Whether the start screen is currently visible.
 * @property {boolean} isStartTransitionRunning - Whether the start-to-game transition is currently running.
 */

/** @type {GameState} */
export const gameState = {
  canvas: null,
  world: null,
  keyboard: new Keyboard(),
  startScreen: null,
  gameBackgroundAudio: createGameBackgroundAudio(getSelectedLevelId()),
  isIntroVisible: true,
  isStartScreenVisible: true,
  isStartTransitionRunning: false,
};