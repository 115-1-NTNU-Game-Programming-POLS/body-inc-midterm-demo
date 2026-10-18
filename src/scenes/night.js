import { C, HAND } from '../ui/theme.js';
import { paper, txt, card, sticky } from '../ui/draw.js';
import { Btn, addButton, drawButtons } from '../ui/button.js';
import { registerScene, enter } from '../core/scenes.js';
import { S } from '../core/state.js';
import { choice } from '../data/choices.js';
import { settleNight } from '../rules/sleep.js';
import { drawXiaochen } from '../art/xiaochen.js';

const PASS = 60;

function drawSleepSheet(n) {
  card(96, 150, 560, 440, C.white);
  const rows = [
    ['睡了多久', `${choice('bed', S.ch.bed).label} 睡到 07:00，共 ${n.sleepH} 小時`],
    ['睡眠效率', n.factors.length ? n.factors.map((f) => `${f[0]} ×${f[1]}`).join('、') : '沒有扣分（×1）'],
    ['有效睡眠', `${n.effSleep.toFixed(1)} 小時`],
    ['睡眠債', `${n.debt0} → ${n.debt1.toFixed(1)} 小時`],
    ['今天讀書', `${n.studyH} 小時，效率 ×${n.studyEff.toFixed(2)}`],
    ['學業進度', `${S.progress} → ${n.progress.toFixed(1)} 點`],
  ];
  rows.forEach(([k, v], i) => {
    txt(k, 124, 178 + i * 66, 22, C.soft, { font: HAND });
    txt(v, 260, 178 + i * 66, 22, C.ink, { font: HAND, bold: true, w: 370 });
  });
}

function drawExam(n) {
  sticky(720, 150, 460, 300, 0.015, 'rgba(0,0,0,0.12)');
  txt('第 5 天｜期中考', 750, 172, 24, C.red, { font: HAND, bold: true });
  txt(`${n.score}`, 750, 206, 96, n.score >= PASS ? C.blue : C.red, { font: HAND, bold: true });
  txt('分', 750 + (n.score >= 100 ? 168 : 116), 260, 30, C.ink, { font: HAND });
  txt(`考試分數 = 學業進度 × 考試當天睡眠係數（${n.sExam.toFixed(2)}）`, 750, 330, 18, C.soft, { w: 420 });
  txt('同樣的讀書量，睡得越少，打折越多。', 750, 384, 18, C.soft, { w: 420 });
  drawXiaochen(700, 440, 0.4, n.score >= PASS ? 'happy' : 'sad');
}

registerScene('night', {
  enter() {
    settleNight();
    addButton(new Btn('快轉到第 7 天（展示用）→', 860, 620, 340, 62, () => enter('report'), { bg: C.blue, size: 22 }));
  },
  draw() {
    paper();
    const n = S.night;
    txt('第 4 天晚上｜睡眠結算', 96, 44, 22, C.red, { font: HAND });
    txt(n.debt1 > n.debt0 ? '睡眠債又變多了' : '今晚有好好還債', 96, 74, 40, C.blue, { font: HAND, bold: true });
    drawSleepSheet(n);
    drawExam(n);
    drawButtons();
  },
  skip() { enter('report'); },
});
