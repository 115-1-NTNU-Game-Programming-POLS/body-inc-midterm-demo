import { C, HAND } from '../ui/theme.js';
import { paper, txt } from '../ui/draw.js';
import { Btn, addButton, drawButtons } from '../ui/button.js';
import { registerScene, enter } from '../core/scenes.js';
import { S } from '../core/state.js';
import { emit } from '../core/events.js';
import { reportLines } from '../rules/report.js';
import { portrait } from '../art/portraits.js';
import { drawXiaochen } from '../art/xiaochen.js';

const STAMP_DELAY = 600;
const STAMP_MS = 300;

function drawReportSheet() {
  noStroke();
  fill(C.ink);
  rect(104, 158, 760, 470);
  fill(C.white);
  stroke(C.ink);
  strokeWeight(2);
  rect(96, 150, 760, 470);
  txt('人體股份有限公司　倒閉調查報告', 476, 178, 30, C.ink, { font: HAND, bold: true, align: CENTER });
  stroke(C.ink);
  strokeWeight(2);
  line(130, 226, 822, 226);
  txt('事故經過', 130, 246, 22, C.ink, { font: HAND, bold: true });
  txt(reportLines().join(''), 130, 280, 22, C.ink, { font: HAND, w: 560, leading: 36 });
  txt('結果：公司宣告倒閉。', 130, 520, 22, C.ink, { font: HAND, bold: true });
  txt('調查委員會建議：閱讀員工手冊〈睡眠與免疫力〉。', 130, 560, 22, C.ink, { font: HAND });
}

// The "倒閉" stamp slams down shortly after the report appears.
function drawStamp() {
  const t = Math.min(1, (millis() - S.enteredAt - STAMP_DELAY) / STAMP_MS);
  if (t <= 0) return;
  if (!S.flags.stamped) { S.flags.stamped = true; emit('report:stamp'); }
  push();
  translate(760, 520);
  rotate(-0.26);
  scale(1 + (1 - t) * 1.2);
  noFill();
  stroke(`rgba(200,55,45,${t})`);
  strokeWeight(6);
  ellipse(0, 0, 150);
  txt('倒閉', 0, 2, 44, `rgba(200,55,45,${t})`, { font: HAND, bold: true, align: CENTER, valign: CENTER });
  pop();
}

registerScene('report', {
  enter() {
    addButton(new Btn('解鎖員工手冊 →', 940, 620, 260, 62, () => enter('handbook'), { bg: C.blue, size: 22 }));
  },
  draw() {
    paper();
    txt('失敗也是教材', 96, 44, 22, C.red, { font: HAND });
    txt('倒閉了？報告會告訴你為什麼', 96, 74, 40, C.blue, { font: HAND, bold: true });
    drawReportSheet();
    drawStamp();
    txt('報告由因果紀錄自動追溯：每個狀態都記得是哪件事造成的。本展示的第 5 至 7 天以快轉帶過。', 900, 170, 18, C.soft, { w: 320, leading: 28 });
    drawXiaochen(890, 330, 0.44, 'sad');
    portrait('immune', 1050, 360, 170, 'quit');
    txt('免疫保全部：罷工中', 1135, 540, 18, C.red, { font: HAND, align: CENTER });
    drawButtons();
  },
  skip() { enter('handbook'); },
});
