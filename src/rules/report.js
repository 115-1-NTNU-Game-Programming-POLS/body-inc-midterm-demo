import { S } from '../core/state.js';
import { choice } from '../data/choices.js';

// The bankruptcy report traces the run's choices back to the final collapse.
export function reportLines() {
  const bed = choice('bed', S.ch.bed).label;
  const lines = [];
  lines.push(S.ch.bed > 23
    ? `第 4 天，小晨為了期中考熬到 ${bed}，大腦部門加班到深夜；`
    : `第 4 天，小晨雖然 23:00 就寢，睡眠債仍有 ${S.debt.toFixed(1)} 小時；`);
  const c = S.flags.crisis;
  lines.push(c === 'ignore' ? '下午室友狂咳時，免疫保全部的人手缺口始終沒有補上；'
    : c === 'brain' ? '營運長從大腦挪人支援免疫部，期中考後又全數調回讀書；'
      : c === 'borrow' ? '營運長向夜班借調人手，當晚的修復工作只完成七成；'
        : '免疫部雖然補足人手，怨氣卻一路逼近罷工；');
  if (S.flags.snack) lines.push('當晚還加點了鹹酥雞，胃部被迫上夜班。');
  lines.push('第 7 天，室友的流感病毒長驅直入，免疫部罷工，小晨第二次被送進急診。');
  return lines;
}
