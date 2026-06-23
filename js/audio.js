function createLoopingAudio(src, volume = 0.35) {
	const audio = new Audio(src);
	audio.loop = true;
	audio.volume = volume;
	audio.preload = 'auto';
	audio.addEventListener('ended', () => {
		audio.currentTime = 0;
		audio.play().catch(() => {});
	});
	return audio;
}

export function createStartScreenAudio() {
	return createLoopingAudio('assets/audio/No More Magic.mp3');
}

export function createGameBackgroundAudio() {
	return createLoopingAudio('assets/audio/Magical Forest.mp3');
}

export function createCoinPickupAudio() {
	const audio = new Audio('assets/audio/Fantasy Sound Library/Mp3/Pickup_Gold_00.mp3');
	audio.volume = 0.45;
	audio.preload = 'auto';
	return audio;
}

export function createRunningFootstepAudios() {
	return ['05', '06', '07'].map((variant) => {
		const audio = new Audio(`assets/audio/Footstep_Dirt_${variant}.wav`);
		audio.volume = 0.22;
		audio.preload = 'auto';
		return audio;
	});
}

export function createJumpEffortAudios() {
	return ['01', '02', '03'].map((variant) => {
		const audio = new Audio(`assets/audio/${variant}._effort_grunt_male.wav`);
		audio.volume = 0.28;
		audio.preload = 'auto';
		return audio;
	});
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
