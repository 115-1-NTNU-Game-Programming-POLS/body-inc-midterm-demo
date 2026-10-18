import { C, HAND } from '../../ui/theme.js';
import { txt, card, sticky, rbc, emptyToken } from '../../ui/draw.js';
import { S } from '../../core/state.js';
import { DEPTS, WARN_AT, QUIT_AT, BRAIN_RESERVED } from '../../data/departments.js';
import { choice } from '../../data/choices.js';
import { crisisShortfall, crisisCovered, RESENT_PER_MOVE } from '../../rules/crisis.js';
import { portrait } from '../../art/portraits.js';
import { PANEL_X, rowRect, dotPos, poolDotPos, POOL_RECT } from './layout.js';

function clock(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h % 1) * 60 / 10) * 10;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function drawClock() {
  card(PANEL_X, 20, 500, 64, C.white);
  txt('第 4 天（四）', PANEL_X + 20, 36, 20, C.red, { font: HAND });
  txt(clock(S.hour), PANEL_X + 150, 26, 40, C.blue, { font: HAND, bold: true });
}

function drawResentBar(r, res) {
  const bx = r.x + 12;
  const bw = 104;
  const by = r.y + 112;
  noStroke();
  fill('#ECE8DD');
  rect(bx, by, bw, 10, 5);
  fill(res >= QUIT_AT ? C.darkRed : res >= WARN_AT ? C.red : '#E3A23B');
  rect(bx, by, bw * res / 100, 10, 5);
  stroke(C.ink);
  strokeWeight(1.2);
  line(bx + bw * WARN_AT / 100, by - 3, bx + bw * WARN_AT / 100, by + 13);
  line(bx + bw * QUIT_AT / 100, by - 3, bx + bw * QUIT_AT / 100, by + 13);
  txt(`${res}`, r.x + r.w - 10, by + 5, 15, res >= WARN_AT ? C.red : C.mute, { align: RIGHT, valign: CENTER });
}

function drawEmployeeCard(d, i) {
  const r = rowRect(i);
  const target = S.crisis && d.id === 'immune';
  const res = S.resent[d.id];
  card(r.x, r.y, r.w, r.h, target ? C.pinkBg : C.white, target || res >= WARN_AT ? C.red : '#C9C2B2', target ? 3 : res >= WARN_AT ? 2.4 : 1.8);
  portrait(d.id, r.x + 2, r.y + 2, 76);
  txt(d.name, r.x + 82, r.y + 14, 22, C.ink, { font: HAND, bold: true });
  txt(res >= QUIT_AT ? '罷工中' : res >= WARN_AT ? '抱怨中' : '上班中', r.x + 82, r.y + 46, 15, res >= WARN_AT ? C.red : C.mute);
  for (let k = 0; k < S.tokens[d.id]; k++) {
    const [x, y] = dotPos(i, k);
    rbc(x, y, 9);
    if (d.id === 'brain' && k < BRAIN_RESERVED) {
      noFill();
      stroke(C.blue);
      strokeWeight(2);
      ellipse(x, y, 24);
    }
  }
  if (target) {
    for (let k = S.tokens.immune; k < S.crisis.target; k++) emptyToken(...dotPos(i, k), 9);
  }
  drawResentBar(r, res);
}

function drawPool() {
  card(POOL_RECT.x, POOL_RECT.y, POOL_RECT.w, POOL_RECT.h, C.white, '#C9C2B2', 1.8);
  txt('待命池', PANEL_X + 16, 414, 21, C.ink, { font: HAND, bold: true });
  for (let k = 0; k < S.pool; k++) rbc(...poolDotPos(k), 10);
  if (S.pool === 0) txt('（空了）', PANEL_X + 110, 416, 18, C.red, { font: HAND });
}

function drawCrisisBox() {
  card(PANEL_X, 476, 500, 164, C.pinkBg, C.red, 3);
  txt('調度危機（時間暫停）', PANEL_X + 20, 488, 24, C.darkRed, { font: HAND, bold: true });
  txt(`免疫部還缺 ${crisisShortfall()} 枚，待命池只有 ${S.pool} 枚。把紅血球拖到免疫部；從別的部門挪人，該部門怨氣 +${RESENT_PER_MOVE}。`,
    PANEL_X + 20, 524, 17, C.ink, { w: 360, leading: 25 });
  portrait('immune', PANEL_X + 404, 498, 84, 'warning');
  txt(`已補 ${crisisCovered()} / ${S.crisis.need}`, PANEL_X + 480, 492, 18, C.darkRed, { font: HAND, align: RIGHT });
}

function drawSchedule() {
  sticky(PANEL_X, 476, 500, 164, { shadow: 'rgba(42,45,52,0.10)', dx: 5, dy: 6 });
  txt('今日行程', PANEL_X + 20, 488, 22, C.red, { font: HAND, bold: true });
  const lines = [
    ['上午', '上課'],
    ['下午', choice('afternoon', S.ch.afternoon).label],
    ['晚上', choice('evening', S.ch.evening).label],
    ['就寢', choice('bed', S.ch.bed).label],
  ];
  lines.forEach(([k, v], i) => {
    txt(k, PANEL_X + 20 + (i % 2) * 240, 528 + Math.floor(i / 2) * 44, 22, C.soft, { font: HAND });
    txt(v, PANEL_X + 80 + (i % 2) * 240, 528 + Math.floor(i / 2) * 44, 22, C.ink, { font: HAND, bold: true });
  });
}

function drawMarquee() {
  noStroke();
  fill(C.ink);
  rect(PANEL_X, 652, 500, 48, 10);
  txt(S.marquee, PANEL_X + 18, 656, 16, C.paper, { w: 470, h: 44, leading: 21 });
}

export function drawPanel() {
  drawClock();
  DEPTS.forEach(drawEmployeeCard);
  txt(`怨氣條：${WARN_AT} 抱怨｜${QUIT_AT} 罷工`, PANEL_X + 500, 372, 13, C.mute, { align: RIGHT });
  drawPool();
  if (S.crisis) drawCrisisBox(); else drawSchedule();
  drawMarquee();
}
