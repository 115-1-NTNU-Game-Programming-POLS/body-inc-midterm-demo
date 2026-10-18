import { mixer } from './mixer.js';

// Sound effects are synthesized with the Web Audio API; there are no effect files.
// Keep helpers module-scoped: as globals, p5's global mode would overwrite names like `noise`.
// While an effect is being built, `cur` holds the context and the trim bus it renders into.
let cur = null;

function tone(freq, dur, o = {}) {
  const { ctx, out } = cur;
  const t0 = ctx.currentTime + (o.delay || 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain || 0.15, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur, o = {}) {
  const { ctx, out } = cur;
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
  src.connect(f).connect(g).connect(out);
  src.start(t0);
}

export const SFX = {
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
// K-weighted window, which sits just above the music). Re-measure when an effect changes:
// pass an OfflineAudioContext as `dest` to render an effect without playing it.
const SFX_TRIM = {
  click: 15, pick: 11.1, drop: 9.5, miss: 12.6, blip: 20.8, pop: 15.1,
  alarm: 9.2, card: 6.7, good: 6.5, bad: 7.2, stamp: -2.8, unlock: 3.6,
};

export function sfx(name, dest = null) {
  const ctx = dest ? dest.ctx : mixer.ctx;
  if (!SFX[name] || !ctx || (!dest && mixer.muted)) return;
  const out = ctx.createGain();
  out.gain.value = 10 ** ((SFX_TRIM[name] || 0) / 20);
  out.connect(dest ? dest.master : mixer.master);
  cur = { ctx, out };
  try { SFX[name](); } finally { cur = null; }
}
