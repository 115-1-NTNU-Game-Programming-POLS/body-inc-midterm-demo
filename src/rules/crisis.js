import { S } from '../core/state.js';
import { emit } from '../core/events.js';
import { toast, say } from '../core/feedback.js';
import { DEPTS, BRAIN_RESERVED } from '../data/departments.js';

export const CRISIS_HOUR = 14;
export const BORROW_TOKENS = 2;
export const BORROW_SLEEP = 0.7;
export const RESENT_PER_MOVE = 10;
const RESENT_IF_IGNORED = 25;

// The roommate starts coughing: the immune department needs more hands than the pool has,
// so the clock pauses until the player covers the gap.
export function startCrisis() {
  S.hour = CRISIS_HOUR;
  const need = Math.max(2, S.pool + 1);
  S.crisis = { target: S.tokens.immune + need, need, moved: [], borrowed: false };
  emit('crisis:start');
  S.marquee = '調度危機！室友在宿舍狂咳，免疫部要求增援。';
  say('immune', '病毒來了，人手不夠！', 6000);
}

export function crisisShortfall() {
  return S.crisis ? S.crisis.target - S.tokens.immune : 0;
}

export function crisisCovered() {
  return S.crisis ? S.tokens.immune - (S.crisis.target - S.crisis.need) : 0;
}

// The single source of truth for which sources may give up a token.
export function canMoveFrom(id) {
  if (id === 'pool') return S.pool > 0;
  if (id === 'immune') return false;
  if (id === 'brain' && S.tokens.brain <= BRAIN_RESERVED) return false;
  return S.tokens[id] > 0;
}

// Move one token to the immune department. Taking staff from another department costs resentment.
export function moveToken(from) {
  if (!canMoveFrom(from)) {
    if (from === 'brain' && S.tokens.brain <= BRAIN_RESERVED) toast(`大腦固定保障 ${BRAIN_RESERVED} 枚，不能挪`);
    return;
  }
  if (from === 'pool') {
    S.pool -= 1;
  } else {
    S.tokens[from] -= 1;
    S.resent[from] = Math.min(100, S.resent[from] + RESENT_PER_MOVE);
    say(from, from === 'brain' ? '我的專注力預算呢？' : '人被挪走了，工作做不完！');
  }
  S.tokens.immune += 1;
  emit('token:moved', from);
  S.crisis.moved.push(from);
  if (S.tokens.immune >= S.crisis.target) {
    const moved = S.crisis.moved;
    S.flags.crisis = moved.includes('brain') ? 'brain'
      : moved.some((m) => m !== 'pool') ? 'other' : S.crisis.borrowed ? 'borrow' : 'pool';
    endCrisis();
  }
}

export function borrowNightShift() {
  if (!S.crisis || S.crisis.borrowed) return;
  S.crisis.borrowed = true;
  S.pool += BORROW_TOKENS;
  S.sleepFactors.push(['向夜班借調', BORROW_SLEEP]);
  toast(`夜班借來 ${BORROW_TOKENS} 枚，直接派去免疫部；代價是今晚睡眠效率 ×${BORROW_SLEEP}`);
  // Borrowed staff go straight to the department in trouble.
  for (let k = 0; k < BORROW_TOKENS && S.crisis && S.pool > 0; k++) moveToken('pool');
}

export function ignoreCrisis() {
  S.flags.crisis = 'ignore';
  S.resent.immune = Math.min(100, S.resent.immune + RESENT_IF_IGNORED);
  say('immune', '人手不夠……快撐不住了');
  endCrisis();
}

// Presenter skip: cover the gap from the pool first, then spare brain staff, then anyone else.
// Every pick passes canMoveFrom, which is also moveToken's guard, so each pass moves a token.
export function autoResolveCrisis() {
  while (S.crisis) {
    const from = ['pool', 'brain', ...DEPTS.map((d) => d.id)].find(canMoveFrom);
    if (!from) { S.flags.crisis = 'ignore'; endCrisis(); break; }
    moveToken(from);
  }
}

function endCrisis() {
  S.crisis = null;
  const ignored = S.flags.crisis === 'ignore';
  emit('crisis:end', S.flags.crisis);
  toast(ignored ? '免疫部的缺口沒補上，怨氣大增' : '危機解除，時間繼續');
}
