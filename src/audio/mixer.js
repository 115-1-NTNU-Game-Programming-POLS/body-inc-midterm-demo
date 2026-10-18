// Shared audio context, master bus and the global mute switch for music and effects.
const MUTE_KEY = 'bodyinc-muted';

export const mixer = { ctx: null, master: null, muted: false, started: false };
try { mixer.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* storage blocked */ }

const startHooks = [];
const muteHooks = [];
export function onAudioStart(fn) { startHooks.push(fn); }
export function onMuteChange(fn) { muteHooks.push(fn); }

// Browsers only allow audio after a user gesture, so everything starts on the first press or key.
function start() {
  if (mixer.started) { mixer.ctx?.resume(); return; }
  mixer.started = true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    mixer.ctx = new AC();
    mixer.master = mixer.ctx.createGain();
    mixer.master.gain.value = mixer.muted ? 0 : 1;
    // Limiter so overlapping effects (e.g. several drops on a skip) do not clip.
    const lim = mixer.ctx.createDynamicsCompressor();
    lim.threshold.value = -2;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.002;
    lim.release.value = 0.1;
    mixer.master.connect(lim).connect(mixer.ctx.destination);
  }
  for (const fn of startHooks) fn();
}

export function installAudioUnlock() {
  for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, start, true);
}

export function toggleMute() {
  mixer.muted = !mixer.muted;
  try { localStorage.setItem(MUTE_KEY, mixer.muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
  if (mixer.master) mixer.master.gain.value = mixer.muted ? 0 : 1;
  for (const fn of muteHooks) fn(mixer.muted);
}
