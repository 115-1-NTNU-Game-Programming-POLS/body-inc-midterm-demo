// Background music: CC BY 4.0 tracks by Kevin MacLeod, credited on the title screen and in README.
const TRACKS = [
  { file: 'monkeys-spinning-monkeys.mp3', title: 'Monkeys Spinning Monkeys' },
  { file: 'carefree.mp3', title: 'Carefree' },
  { file: 'fluffing-a-duck.mp3', title: 'Fluffing a Duck' },
];
const MUSIC_VOL = 0.32;

const AUDIO = { ctx: null, master: null, bgm: null, track: 0, muted: false, started: false };
try { AUDIO.muted = localStorage.getItem('bodyinc-muted') === '1'; } catch (e) { /* storage blocked */ }

function playTrack(i) {
  AUDIO.track = i % TRACKS.length;
  AUDIO.bgm.src = `assets/music/${TRACKS[AUDIO.track].file}`;
  if (!AUDIO.muted) AUDIO.bgm.play().catch(() => {});
}

// Browsers only allow audio after a user gesture, so everything starts on the first press or key.
function startAudio() {
  if (AUDIO.started) { AUDIO.ctx?.resume(); return; }
  AUDIO.started = true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (AC) {
    AUDIO.ctx = new AC();
    AUDIO.master = AUDIO.ctx.createGain();
    AUDIO.master.gain.value = AUDIO.muted ? 0 : 1;
    // Limiter so overlapping effects (e.g. several drops on a skip) do not clip.
    const lim = AUDIO.ctx.createDynamicsCompressor();
    lim.threshold.value = -2;
    lim.knee.value = 0;
    lim.ratio.value = 20;
    lim.attack.value = 0.002;
    lim.release.value = 0.1;
    AUDIO.master.connect(lim).connect(AUDIO.ctx.destination);
  }
  AUDIO.bgm = new Audio();
  AUDIO.bgm.volume = MUSIC_VOL;
  AUDIO.bgm.addEventListener('ended', () => playTrack(AUDIO.track + 1));
  playTrack(0);
}
for (const type of ['pointerdown', 'keydown']) window.addEventListener(type, startAudio, true);

document.addEventListener('visibilitychange', () => {
  if (!AUDIO.bgm || AUDIO.muted) return;
  if (document.hidden) AUDIO.bgm.pause(); else AUDIO.bgm.play().catch(() => {});
});

function toggleMute() {
  AUDIO.muted = !AUDIO.muted;
  try { localStorage.setItem('bodyinc-muted', AUDIO.muted ? '1' : '0'); } catch (e) { /* storage blocked */ }
  if (AUDIO.master) AUDIO.master.gain.value = AUDIO.muted ? 0 : 1;
  if (AUDIO.bgm) { if (AUDIO.muted) AUDIO.bgm.pause(); else AUDIO.bgm.play().catch(() => {}); }
}

function tone(freq, dur, o = {}) {
  const ctx = AUDIO.ctx;
  if (!ctx || AUDIO.muted) return;
  const t0 = ctx.currentTime + (o.delay || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain || 0.15, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(AUDIO.out || AUDIO.master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, o = {}) {
  const ctx = AUDIO.ctx;
  if (!ctx || AUDIO.muted) return;
  const t0 = ctx.currentTime + (o.delay || 0);
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = o.cutoff || 1200;
  const g = ctx.createGain();
  g.gain.value = o.gain || 0.3;
  src.connect(f).connect(g).connect(AUDIO.out || AUDIO.master);
  src.start(t0);
}

const SFX = {
  click: () => tone(660, 0.07, { type: 'triangle', gain: 0.12, to: 880 }),
  pick: () => tone(520, 0.09, { type: 'sine', gain: 0.14, to: 780 }),
  drop: () => { tone(780, 0.08, { type: 'triangle', gain: 0.14 }); tone(1040, 0.12, { type: 'triangle', gain: 0.12, delay: 0.06 }); },
  miss: () => tone(300, 0.12, { type: 'sine', gain: 0.1, to: 200 }),
  blip: () => tone(1200, 0.05, { type: 'sine', gain: 0.05 }),
  pop: () => tone(880, 0.09, { type: 'sine', gain: 0.08, to: 1320 }),
  alarm: () => { for (let i = 0; i < 3; i++) { tone(880, 0.14, { type: 'square', gain: 0.07, delay: i * 0.3 }); tone(660, 0.14, { type: 'square', gain: 0.07, delay: i * 0.3 + 0.15 }); } },
  card: () => { noise(0.18, { cutoff: 3000, gain: 0.12 }); tone(520, 0.1, { type: 'triangle', gain: 0.1, delay: 0.1 }); tone(780, 0.14, { type: 'triangle', gain: 0.1, delay: 0.18 }); },
  good: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, { type: 'triangle', gain: 0.12, delay: i * 0.09 })),
  bad: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, { type: 'triangle', gain: 0.12, delay: i * 0.12 })),
  stamp: () => { noise(0.25, { cutoff: 500, gain: 0.6 }); tone(110, 0.25, { type: 'sine', gain: 0.35, to: 55 }); },
  unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i === 3 ? 0.45 : 0.15, { type: 'sine', gain: 0.12, delay: i * 0.1 })),
};
// Per-effect trim in dB so every effect peaks at the same loudness (about -24 dB, 200 ms
// K-weighted window, which sits just above the music). Re-measure when an effect changes.
const SFX_TRIM = {
  click: 15, pick: 11.1, drop: 9.5, miss: 12.6, blip: 20.8, pop: 15.1,
  alarm: 9.2, card: 11.1, good: 6.5, bad: 7.2, stamp: -1.4, unlock: 3.6,
};

function sfx(name) {
  if (!SFX[name] || !AUDIO.ctx || AUDIO.muted) return;
  AUDIO.out = AUDIO.ctx.createGain();
  AUDIO.out.gain.value = 10 ** ((SFX_TRIM[name] || 0) / 20);
  AUDIO.out.connect(AUDIO.master);
  try { SFX[name](); } finally { AUDIO.out = null; }
}

const MUTE_BTN = { x: W - 36, y: H - 42, w: 32, h: 32 };

function drawMuteButton() {
  const { x, y, w, h } = MUTE_BTN;
  const hover = mx() >= x && mx() <= x + w && my() >= y && my() <= y + h;
  fill(hover ? C.sticky : C.white);
  stroke(C.ink);
  strokeWeight(2);
  rect(x, y, w, h, 8);
  noStroke();
  fill(C.ink);
  rect(x + 7, y + 12, 5, 8);
  quad(x + 11, y + 12, x + 18, y + 6, x + 18, y + 26, x + 11, y + 20);
  noFill();
  stroke(AUDIO.muted ? C.red : C.ink);
  strokeWeight(2);
  if (AUDIO.muted) {
    line(x + 21, y + 11, x + 28, y + 21);
    line(x + 28, y + 11, x + 21, y + 21);
  } else {
    arc(x + 18, y + 16, 10, 12, -HALF_PI * 0.8, HALF_PI * 0.8);
    arc(x + 18, y + 16, 18, 20, -HALF_PI * 0.8, HALF_PI * 0.8);
  }
}

function muteButtonHit() {
  const { x, y, w, h } = MUTE_BTN;
  return mx() >= x && mx() <= x + w && my() >= y && my() <= y + h;
}
