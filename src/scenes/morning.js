import { C, HAND } from '../ui/theme.js';
import { paper, txt, card, sticky } from '../ui/draw.js';
import { Btn, buttons, addButton, drawButtons } from '../ui/button.js';
import { registerScene, enter } from '../core/scenes.js';
import { S } from '../core/state.js';
import { CHOICES } from '../data/choices.js';
import { freePool, planComplete, fillDefaultPlan, commitPlan } from '../rules/planning.js';
import { drawXiaochen } from '../art/xiaochen.js';

const ROWS = [['breakfast', 150], ['afternoon', 300], ['evening', 400], ['bed', 500]];

function startDay() {
  commitPlan();
  enter('day');
}

function drawStatus() {
  sticky(96, 150, 380, 220, -0.02);
  push();
  translate(96, 150);
  rotate(-0.02);
  txt('小晨的狀態', 24, 18, 26, C.red, { font: HAND, bold: true });
  const rows = [['睡眠債', `${S.debt} 小時`], ['壓力', `${S.stress} / 100`], ['社交', `${S.social} / 10`], ['學業進度', `${S.progress} 點`]];
  rows.forEach(([k, v], i) => {
    txt(k, 24, 62 + i * 36, 22, C.soft, { font: HAND });
    txt(v, 356, 62 + i * 36, 22, C.ink, { font: HAND, bold: true, align: RIGHT });
  });
  pop();
}

registerScene('morning', {
  enter() {
    for (const [key, y] of ROWS) {
      CHOICES[key].forEach((c, i) => {
        const b = new Btn(c.label, 620 + i * 210, y, 194, 70, () => {
          S.ch[key] = c.id;
          buttons.filter((x) => x.group === key).forEach((x) => { x.o.selected = x.choice === c.id; });
        }, { sub: c.sub, size: 22 });
        b.group = key;
        b.choice = c.id;
        addButton(b);
      });
    }
    addButton(new Btn('開始這一天 →', 940, 616, 274, 62, startDay,
      { bg: C.blue, size: 24, disabled: () => !planComplete() }));
  },
  draw() {
    paper();
    txt('第 4 天（四）早上 07:00', 96, 44, 22, C.red, { font: HAND });
    txt('今天怎麼過？期中考就在明天', 96, 74, 40, C.blue, { font: HAND, bold: true });
    drawStatus();
    drawXiaochen(150, 392, 0.52);
    const label = (s, y) => txt(s, 486, y + 35, 26, C.ink, { font: HAND, bold: true, valign: CENTER });
    label('早餐', 150);
    label('上午', 219);
    card(620, 228, 404, 52, '#ECE8DD', '#B9B3A6', 2);
    txt('上課（必修，不能翹）', 822, 255, 20, C.mute, { font: HAND, align: CENTER, valign: CENTER });
    label('下午', 300);
    label('晚上', 400);
    label('幾點睡', 500);
    drawButtons();
    const pool = freePool();
    txt(`待命池剩 ${pool} 枚：越少，越容易爆發調度危機`, 486, 604, 19, pool <= 2 ? C.red : C.soft, { font: HAND });
    txt('考試分數會依考試當天的睡眠打折', 486, 640, 19, C.soft, { font: HAND });
  },
  skip() {
    fillDefaultPlan();
    startDay();
  },
});
