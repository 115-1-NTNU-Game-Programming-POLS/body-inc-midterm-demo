import { S } from '../core/state.js';
import { emit } from '../core/events.js';
import { toast, say } from '../core/feedback.js';

export const EVENT_HOUR = 19;
const SNACK_SLEEP = 0.9;

// Event card: the roommate asks about a late-night snack. No option is free.
export const EVENT_CARD = {
  where: '事件卡｜19:00 宿舍',
  prompt: '室友在群組揪：「鹹酥雞，來不來？」',
  note: '沒有標準答案：社交也是一種資源。　手冊〈睡前進食與睡眠〉',
  options: [
    {
      label: '走啊！', sub: '社交 +2｜胃要上夜班，睡眠效率 ×0.9',
      apply() { S.social += 2; S.flags.snack = true; S.sleepFactors.push(['宵夜', SNACK_SLEEP]); },
    },
    {
      label: '不了，我要睡', sub: '社交 −1｜壓力 +5',
      apply() { S.social -= 1; S.stress += 5; },
    },
    {
      label: '幫我帶一份', sub: '社交 +1｜胃要上夜班，睡眠效率 ×0.9',
      apply() { S.social += 1; S.flags.snack = true; S.sleepFactors.push(['宵夜', SNACK_SLEEP]); },
    },
  ],
};

export function startEvent() {
  S.hour = EVENT_HOUR;
  S.event = true;
  emit('event:start');
}

export function chooseEventOption(i) {
  const opt = EVENT_CARD.options[i];
  opt.apply();
  S.event = null;
  toast(`你選了「${opt.label}」：${opt.sub}`, 3200);
  if (S.flags.snack) say('stomach', '又要上夜班？！');
}
