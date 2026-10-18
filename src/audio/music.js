import { mixer, onAudioStart, onMuteChange } from './mixer.js';

// Background music: CC BY 4.0 tracks by Kevin MacLeod, credited on the title screen and in README.
// Files are loudness-normalized to -18 LUFS so the level does not jump between tracks.
export const TRACKS = [
  { file: 'monkeys-spinning-monkeys.mp3', title: 'Monkeys Spinning Monkeys' },
  { file: 'carefree.mp3', title: 'Carefree' },
  { file: 'fluffing-a-duck.mp3', title: 'Fluffing a Duck' },
];
const MUSIC_VOL = 0.32;

let bgm = null;
let track = 0;

function resume() { if (bgm && !mixer.muted) bgm.play().catch(() => {}); }

function playTrack(i) {
  track = i % TRACKS.length;
  bgm.src = `assets/music/${TRACKS[track].file}`;
  resume();
}

export function installMusic() {
  onAudioStart(() => {
    bgm = new Audio();
    bgm.volume = MUSIC_VOL;
    bgm.addEventListener('ended', () => playTrack(track + 1));
    playTrack(0);
  });
  onMuteChange((muted) => { if (muted) bgm?.pause(); else resume(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) bgm?.pause(); else resume();
  });
}

// For debugging and tests.
export function musicState() {
  return { track, src: bgm?.src, paused: bgm?.paused ?? true, el: bgm };
}
