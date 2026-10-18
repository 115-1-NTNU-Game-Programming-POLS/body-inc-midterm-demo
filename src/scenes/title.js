import { W, H } from '../ui/canvas.js';
import { C, HAND } from '../ui/theme.js';
import { paper, txt, bubble } from '../ui/draw.js';
import { Btn, addButton, drawButtons } from '../ui/button.js';
import { registerScene, enter } from '../core/scenes.js';
import { DEPTS } from '../data/departments.js';
import { portrait } from '../art/portraits.js';
import { drawXiaochen } from '../art/xiaochen.js';
import { TRACKS } from '../audio/music.js';
import { drawBadge } from '../art/brand.js';

// Beside the title, clear of 小晨's speech bubble (which starts around x = 668).
const BADGE = { x: 518, y: 124, size: 128 };

registerScene('title', {
  enter() {
    addButton(new Btn('開始：第 4 天早上 →', 96, 520, 300, 66, () => enter('morning'), { bg: C.blue, size: 24 }));
  },
  draw() {
    paper();
    txt('遊戲程式設計 115-1｜第七組｜期中提案展示版', 96, 96, 22, C.red, { font: HAND });
    txt('人體股份\n有限公司', 92, 138, 104, C.blue, { font: HAND, bold: true, leading: 116 });
    drawBadge(BADGE.x, BADGE.y, BADGE.size, -0.05);
    noStroke();
    fill(C.yellow);
    rect(92, 422, 520, 18);
    txt('把一學期濃縮成十天，撐到期末考。', 96, 398, 32, C.ink, { font: HAND });
    txt('畫面流程原型：流程照腳本走，數值為示意。', 96, 464, 18, C.mute);
    drawButtons();
    txt('公司員工', 96, 610, 18, C.red, { font: HAND });
    DEPTS.forEach((d, i) => portrait(d.id, 180 + i * 70, 594, 66, 'base'));
    drawXiaochen(800, 150, 0.95);
    bubble('明天就期中考了……', 896, 250, { size: 22, left: true });
    // CC BY 4.0 requires the credit to be visible in the work.
    txt(`音樂：${TRACKS.map((t) => t.title).join('、')}，Kevin MacLeod（incompetech.com），CC BY 4.0`,
      W - 48, H - 12, 13, C.hint, { align: RIGHT, valign: BOTTOM });
  },
  skip() { enter('morning'); },
});
