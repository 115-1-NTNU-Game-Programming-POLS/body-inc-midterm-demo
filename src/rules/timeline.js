import { S } from '../core/state.js';
import { toast, say } from '../core/feedback.js';
import { startCrisis, CRISIS_HOUR } from './crisis.js';
import { startEvent, EVENT_HOUR } from './evening-event.js';

// Real seconds per in-game hour at 1x speed.
export const SEC_PER_HOUR = 1.5;
const LUNCH_TOKENS = 2;

export function isPaused() {
  return Boolean(S.crisis || S.event);
}

export function advanceClock(dtSec) {
  if (isPaused()) return;
  S.hour += dtSec * S.speed / SEC_PER_HOUR;
  runBeats();
}

export function dayOver() {
  return S.hour >= S.ch.bed && !isPaused();
}

// Presenter skip: jump to the next scripted moment.
export function skipAhead() {
  const next = [8, 10.5, 12.5, CRISIS_HOUR, EVENT_HOUR, S.ch.bed].find((t) => t > S.hour + 0.01);
  S.hour = next ?? S.ch.bed;
}

function beat(id, cond, fn) {
  // A crisis or event card pauses the clock; later beats wait until it is resolved.
  if (isPaused()) return;
  if (!S.done[id] && cond) { S.done[id] = true; fn(); }
}

// The scripted day. Each beat fires once when its hour is reached.
export function runBeats() {
  const h = S.hour;
  beat('b8', h >= 8, () => {
    if (S.ch.breakfast === 'skip') {
      say('liver', '（空腹……默默釋放葡萄糖撐住血糖）');
      S.resent.liver += 5;
      S.marquee = '肝臟部門自動加班：沒吃早餐時，由肝臟釋放葡萄糖維持血糖。';
    } else {
      say('stomach', '早餐收到，開工！');
      S.marquee = '物流主管胃：蛋餅與豆漿已入庫。';
    }
  });
  beat('b9', h >= 9.2, () => { S.marquee = '上課中：大腦部門全力運轉。'; });
  beat('b10', h >= 10.5, () => {
    say('immune', '喉嚨有點癢……', 4200);
    S.marquee = '早期症狀：免疫部開始抱怨了。徵兆出現時處理，才不會惡化。';
  });
  beat('b12', h >= 12.5, () => {
    const n = Math.min(LUNCH_TOKENS, S.pool);
    S.pool -= n;
    S.tokens.stomach += n;
    S.flags.lunch = n;
    toast(n === LUNCH_TOKENS ? `午餐：胃要 ${LUNCH_TOKENS} 枚代幣，待命池自動補上，時間不暫停` : '午餐：待命池不夠，胃只補到一部分');
  });
  beat('b13', h >= 13.4, () => {
    if (S.ch.afternoon === 'study') { S.marquee = '下午讀書中：大腦加派人手，讀書效率提升。'; }
    else if (S.ch.afternoon === 'club') { S.social += 2; S.marquee = '社團練習中：社交 +2。'; }
    else { S.debt = Math.max(0, S.debt - 0.3); say('brain', '小睡 20 分鐘，腦袋清楚一點了'); }
  });
  beat('b14', h >= CRISIS_HOUR, () => startCrisis());
  beat('b15', h >= 15.2, () => {
    const n = S.flags.lunch || 0;
    if (n) {
      S.tokens.stomach -= n;
      S.pool += n;
      toast('胃部消化完成，代幣歸還待命池');
    }
  });
  beat('b19', h >= EVENT_HOUR, () => startEvent());
  beat('b21', h >= 21, () => {
    if (S.ch.evening === 'study') { say('brain', '同一行字看了三次……'); S.marquee = '睡眠債的徵兆：注意力開始下降。'; }
    else if (S.ch.evening === 'exercise') { S.stress -= 8; say('muscle', '動一動，壓力下降了！'); }
    else { S.social += 2; S.stress -= 5; S.marquee = '和室友聊天：社交 +2，壓力下降。'; }
  });
  beat('b23', h >= 23.05 && S.ch.bed > 23, () => {
    S.marquee = '超過 23:00：小晨還在熬夜，大腦部門加班中。';
    say('brain', '再讀一小時就睡……');
  });
}
