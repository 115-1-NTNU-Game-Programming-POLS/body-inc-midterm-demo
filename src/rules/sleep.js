import { S } from '../core/state.js';
import { emit } from '../core/events.js';
import { DEPTS, BRAIN_RESERVED } from '../data/departments.js';

// Formulas follow the design doc so the trade-offs read correctly; inputs are illustrative.
const WAKE_HOUR = 31; // 07:00 the next day
const NEED_SLEEP = 8;
export const PASS_SCORE = 60;

// Study and exam multiplier from sleep debt, floored at 0.3.
export function sFactor(debt) { return Math.max(0.3, 1 - 0.07 * debt); }

export function computeNight(st) {
  const sleepH = WAKE_HOUR - st.ch.bed;
  const factors = st.sleepFactors.slice();
  const eff = factors.reduce((p, f) => p * f[1], 1);
  const effSleep = sleepH * eff;
  const debt0 = st.debt;
  const debt1 = effSleep >= NEED_SLEEP ? Math.max(0, debt0 - (effSleep - NEED_SLEEP) * 0.5) : debt0 + (NEED_SLEEP - effSleep);
  const studyH = (st.ch.afternoon === 'study' ? 4 : 0) + (st.ch.evening === 'study' ? 4 : 0) + (st.ch.bed - 23);
  const extra = st.tokens.brain - BRAIN_RESERVED;
  const studyEff = (1 + 0.1 * extra) * sFactor(debt0);
  const progress = st.progress + studyH * studyEff;
  const sExam = sFactor(debt1);
  const score = Math.min(100, Math.round(60 * progress * sExam / 18));
  const passed = score >= PASS_SCORE;
  return { sleepH, factors, eff, effSleep, debt0, debt1, studyH, studyEff, progress, sExam, score, passed };
}

// Apply tonight's sleep: debt changes and sleep lowers every department's resentment.
export function settleNight() {
  const n = computeNight(S);
  S.night = n;
  S.debt = n.debt1;
  for (const d of DEPTS) S.resent[d.id] = Math.max(0, Math.round(S.resent[d.id] - 8 * n.effSleep));
  emit('night:settled', n);
  return n;
}
