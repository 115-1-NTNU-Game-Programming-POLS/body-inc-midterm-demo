import { S } from '../core/state.js';
import { choice, DEFAULT_PLAN } from '../data/choices.js';

const POOL_SIZE = 5;

// Tokens left in the free pool after the day's schedule claims its share.
export function freePool() {
  const a = choice('afternoon', S.ch.afternoon) || {};
  const e = choice('evening', S.ch.evening) || {};
  return POOL_SIZE - (a.brain || 0) - (e.brain || 0) - (e.muscle || 0);
}

export function planComplete() {
  return Object.values(S.ch).every((v) => v !== null);
}

export function fillDefaultPlan() {
  for (const k of Object.keys(S.ch)) S.ch[k] ??= DEFAULT_PLAN[k];
}

export function commitPlan() {
  const a = choice('afternoon', S.ch.afternoon);
  const e = choice('evening', S.ch.evening);
  S.tokens.brain += (a.brain || 0) + (e.brain || 0);
  S.tokens.muscle += e.muscle || 0;
  S.pool = freePool();
}
