/**
 * @typedef {'music' | 'effect'} ManagedAudioCategory
 */

/**
 * Registers an audio element for global mute and category-aware playback handling.
 *
 * @param {HTMLAudioElement} audio - The audio instance to manage.
 * @param {ManagedAudioCategory} category - The logical category used for mute behavior.
 * @returns {HTMLAudioElement} The same audio instance for fluent factory usage.
 */
const managedAudios = new Set();
const audioCategories = new WeakMap();
let isMusicMuted = false;

function registerManagedAudio(audio, category) {
	audioCategories.set(audio, category);
	audio.muted = category === 'music' ? isMusicMuted : audio.muted;
	managedAudios.add(audio);
	return audio;
}

function createManagedAudio(src, category, { volume = 1, loop = false, preload = 'metadata' } = {}) {
	const audio = new Audio(src);
	audio.loop = loop;
	audio.volume = volume;
	audio.preload = preload;
	return registerManagedAudio(audio, category);
}

function ensureAudioLoaded(audio) {
	if (!audio) return;
	if (audio.networkState !== HTMLMediaElement.NETWORK_EMPTY) return;

	audio.load();
}

/**
 * Creates a looping background track and registers it as music.
 *
 * @param {string} src - The source path of the audio file.
 * @param {number} [volume=0.35] - The playback volume between 0 and 1.
 * @returns {HTMLAudioElement} The configured looping audio element.
 */
function createLoopingAudio(src, volume = 0.35) {
	const audio = createManagedAudio(src, 'music', {
		loop: true,
		preload: 'none',
		volume,
	});
	audio.addEventListener('ended', () => {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	});
	return audio;
}

/**
 * Creates the looping background music used on the animated start screen.
 *
 * @returns {HTMLAudioElement} The configured start-screen music track.
 */
export function createStartScreenAudio() {
	return createLoopingAudio('assets/audio/No More Magic.mp3');
}

/**
 * Creates the main in-game looping background music.
 *
 * @returns {HTMLAudioElement} The configured gameplay background track.
 */
export function createGameBackgroundAudio() {
	return createLoopingAudio('assets/audio/Magical Forest.mp3');
}

/**
 * Creates the looping boss encounter music.
 *
 * @returns {HTMLAudioElement} The configured boss music track.
 */
export function createBossMusicAudio() {
	return createLoopingAudio('assets/audio/boss_music.mp3', 0.38);
}

/**
 * Creates the boss laugh sound effect.
 *
 * @returns {HTMLAudioElement} The configured laugh sound effect.
 */
export function createEvilLaughAudio() {
	return createManagedAudio('assets/audio/evil-laugh.mp3', 'effect', {
		volume: 0.42,
		preload: 'none',
	});
}

/**
 * Creates the game over sound effect.
 *
 * @returns {HTMLAudioElement} The configured game over sound effect.
 */
export function createGameOverAudio() {
	return createManagedAudio('assets/audio/game-over.mp3', 'effect', {
		volume: 0.9,
		preload: 'none',
	});
}

/**
 * Creates the coin pickup sound effect.
 *
 * @returns {HTMLAudioElement} The configured pickup sound effect.
 */
export function createCoinPickupAudio() {
	return createManagedAudio('assets/audio/Fantasy Sound Library/Mp3/Pickup_Gold_00.mp3', 'effect', {
		volume: 0.45,
		preload: 'none',
	});
}

/**
 * Creates the pickup sound for throwable items.
 *
 * @returns {HTMLAudioElement} The configured throwable pickup sound effect.
 */
export function createThrowableObjectPickupAudio() {
	return createManagedAudio('assets/audio/pickup-item.mp3', 'effect', {
		volume: 0.6,
		preload: 'none',
	});
}

/**
 * Creates the pickup sound for collectible mushrooms.
 *
 * @returns {HTMLAudioElement} The configured mushroom pickup sound effect.
 */
export function createMushroomPickupAudio() {
	return createManagedAudio('assets/audio/pickup-mushroom.mp3', 'effect', {
		volume: 0.6,
		preload: 'none',
	});
}

/**
 * Creates the sound effect used when the player throws a bone.
 *
 * @returns {HTMLAudioElement} The configured throwing sound effect.
 */
export function createThrowingAudio() {
	return createManagedAudio('assets/audio/throwing.mp3', 'effect', {
		volume: 0.35,
		preload: 'none',
	});
}

/**
 * Creates the sword slashing sound effect used by Skeleton Warrior 2.
 *
 * @returns {HTMLAudioElement} The configured slashing sound effect.
 */
export function createSwordSlashingAudio() {
	return createManagedAudio('assets/audio/sword-slashing.mp3', 'effect', {
		volume: 0.35,
		preload: 'none',
	});
}

/**
 * Creates the set of running footstep variations.
 *
 * @returns {HTMLAudioElement[]} The registered footstep sound variants.
 */
export function createRunningFootstepAudios() {
	return ['05', '06', '07'].map((variant) => {
		return createManagedAudio(`assets/audio/Footstep_Dirt_${variant}.wav`, 'effect', {
			volume: 0.4,
			preload: 'none',
		});
	});
}

/**
 * Creates the set of jump effort vocal variations.
 *
 * @returns {HTMLAudioElement[]} The registered jump effort sound variants.
 */
export function createJumpEffortAudios() {
	return ['01', '02', '03'].map((variant) => {
		return createManagedAudio(`assets/audio/${variant}._effort_grunt_male.wav`, 'effect', {
			volume: 0.2,
			preload: 'none',
		});
	});
}

/**
 * Creates the set of bone break sound variations.
 *
 * @returns {HTMLAudioElement[]} The registered bone break sound variants.
 */
export function createBoneBreakAudios() {
	return ['01', '02', '03'].map((variant) => {
		return createManagedAudio(`assets/audio/bonebreak ${variant}.mp3`, 'effect', {
			volume: 0.1,
			preload: 'none',
		});
	});
}

/**
 * Toggles the global mute state for all registered music tracks.
 *
 * @param {boolean} nextMuted - Whether music should be muted.
 * @returns {void}
 */
export function setMusicMuted(nextMuted) {
	isMusicMuted = nextMuted;
	managedAudios.forEach((audio) => {
		if (audioCategories.get(audio) === 'music') {
			audio.muted = isMusicMuted;
		}
	});
}

/**
 * Returns the current global music mute state.
 *
 * @returns {boolean} True when music is muted.
 */
export function getMusicMuted() {
	return isMusicMuted;
}

/**
 * Starts a looping background track when it is not already playing.
 *
 * @param {HTMLAudioElement | null | undefined} audio - The music track to start.
 * @returns {void}
 */
export function playBackgroundAudio(audio) {
	if (!audio || !audio.paused) return;
	ensureAudioLoaded(audio);
	audio.play().catch(() => {});
}

/**
 * Stops a looping background track and rewinds it to the start.
 *
 * @param {HTMLAudioElement | null | undefined} audio - The music track to stop.
 * @returns {void}
 */
export function stopBackgroundAudio(audio) {
	if (!audio) return;
	audio.pause();
	audio.currentTime = 0;
}

/**
 * Plays a one-shot sound effect from the beginning.
 *
 * @param {HTMLAudioElement | null | undefined} audio - The sound effect to play.
 * @returns {void}
 */
export function playSoundEffect(audio) {
	if (!audio) return;
	ensureAudioLoaded(audio);
	audio.currentTime = 0;
	audio.play().catch(() => {});
}

/**
 * Plays a random sound variant while avoiding the previously used index when possible.
 *
 * @param {HTMLAudioElement[] | null | undefined} audios - The available sound variants.
 * @param {number} [lastIndex=-1] - The most recently used variant index.
 * @returns {number} The index of the variant that was played, or the input index when none exist.
 */
export function playRandomVariantSound(audios, lastIndex = -1) {
	if (!audios?.length) return lastIndex;
	const variants = audios.length > 1 ? audios.map((_, index) => index).filter((index) => index !== lastIndex) : [0];
	const nextIndex = variants[Math.floor(Math.random() * variants.length)];
	playSoundEffect(audios[nextIndex]);
	return nextIndex;
}
