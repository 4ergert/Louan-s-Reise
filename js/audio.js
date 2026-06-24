const managedAudios = new Set();
const audioCategories = new WeakMap();
let isMusicMuted = false;

function registerManagedAudio(audio, category) {
	audioCategories.set(audio, category);
	audio.muted = category === 'music' ? isMusicMuted : audio.muted;
	managedAudios.add(audio);
	return audio;
}

function createLoopingAudio(src, volume = 0.35) {
	const audio = new Audio(src);
	audio.loop = true;
	audio.volume = volume;
	audio.preload = 'auto';
	audio.addEventListener('ended', () => {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	});
	return registerManagedAudio(audio, 'music');
}

export function createStartScreenAudio() {
	return createLoopingAudio('assets/audio/No More Magic.mp3');
}

export function createGameBackgroundAudio() {
	return createLoopingAudio('assets/audio/Magical Forest.mp3');
}

export function createBossMusicAudio() {
	return createLoopingAudio('assets/audio/boss_music.mp3', 0.38);
}

export function createGameOverAudio() {
	const audio = new Audio('assets/audio/game-over.mp3');
	audio.volume = 0.8;
	audio.preload = 'auto';
	return registerManagedAudio(audio, 'effect');
}

export function createCoinPickupAudio() {
	const audio = new Audio('assets/audio/Fantasy Sound Library/Mp3/Pickup_Gold_00.mp3');
	audio.volume = 0.45;
	audio.preload = 'auto';
	return registerManagedAudio(audio, 'effect');
}

export function createRunningFootstepAudios() {
	return ['05', '06', '07'].map((variant) => {
		const audio = new Audio(`assets/audio/Footstep_Dirt_${variant}.wav`);
		audio.volume = 0.32;
		audio.preload = 'auto';
		return registerManagedAudio(audio, 'effect');
	});
}

export function createJumpEffortAudios() {
	return ['01', '02', '03'].map((variant) => {
		const audio = new Audio(`assets/audio/${variant}._effort_grunt_male.wav`);
		audio.volume = 0.1;
		audio.preload = 'auto';
		return registerManagedAudio(audio, 'effect');
	});
}

export function createBoneBreakAudios() {
	return ['01', '02', '03'].map((variant) => {
		const audio = new Audio(`assets/audio/bonebreak ${variant}.mp3`);
		audio.volume = 0.35;
		audio.preload = 'auto';
		return registerManagedAudio(audio, 'effect');
	});
}

export function setMusicMuted(nextMuted) {
	isMusicMuted = nextMuted;
	managedAudios.forEach((audio) => {
		if (audioCategories.get(audio) === 'music') {
			audio.muted = isMusicMuted;
		}
	});
}

export function getMusicMuted() {
	return isMusicMuted;
}

export function playBackgroundAudio(audio) {
	if (!audio || !audio.paused) return;
	audio.play().catch(() => {});
}

export function stopBackgroundAudio(audio) {
	if (!audio) return;
	audio.pause();
	audio.currentTime = 0;
}

export function playSoundEffect(audio) {
	if (!audio) return;
	audio.currentTime = 0;
	audio.play().catch(() => {});
}

export function playRandomVariantSound(audios, lastIndex = -1) {
	if (!audios?.length) return lastIndex;
	const variants = audios.length > 1 ? audios.map((_, index) => index).filter((index) => index !== lastIndex) : [0];
	const nextIndex = variants[Math.floor(Math.random() * variants.length)];
	playSoundEffect(audios[nextIndex]);
	return nextIndex;
}
