import { C, HAND, SANS } from '../ui/theme.js';
import { paper, txt, card, sticky } from '../ui/draw.js';
import { Btn, addButton, drawButtons } from '../ui/button.js';
import { registerScene, enter, newGame } from '../core/scenes.js';
import { HANDBOOK_SLEEP_IMMUNITY as PAGE } from '../data/handbook.js';
import { drawXiaochen } from '../art/xiaochen.js';

const BODY = { size: 22, leading: 36, font: HAND, col: C.ink };
const NOTE = { size: 18, leading: 28, font: SANS, col: C.mute };

function drawPage() {
  card(96, 150, 700, 340, C.white);
  let y = 178;
  const paras = [...PAGE.paragraphs.map((p) => [p, BODY]), [PAGE.disclaimer, NOTE]];
  for (const [p, st] of paras) {
    txt(p, 128, y, st.size, st.col, { font: st.font, w: 636, leading: st.leading });
    textSize(st.size);
    textFont(st.font);
    y += Math.ceil(textWidth(p) / 620) * st.leading + 24;
  }
}

registerScene('handbook', {
  enter() {
    addButton(new Btn('再玩一次', 860, 620, 170, 62, () => { newGame(); enter('morning'); }, { bg: C.blue, size: 22 }));
    addButton(new Btn('回標題', 1046, 620, 150, 62, () => newGame(), { size: 22 }));
  },
  draw() {
    paper();
    txt('跨局進度：解鎖的手冊頁永久保留', 96, 44, 22, C.red, { font: HAND });
    txt(PAGE.title, 96, 74, 40, C.blue, { font: HAND, bold: true });
    drawPage();
    sticky(850, 160, 340, 150, 0.03, null);
    txt('下一局解鎖新選項', 874, 180, 22, C.red, { font: HAND, bold: true });
    txt(PAGE.unlocks, 874, 220, 20, C.ink, { font: HAND, w: 300 });
    drawXiaochen(930, 330, 0.48, 'happy');
    drawButtons();
  },
  skip() { newGame(); },
});
