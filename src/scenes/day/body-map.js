import { C, HAND } from '../../ui/theme.js';
import { txt, drawPath, drawShapes, rbc, bubble } from '../../ui/draw.js';
import { S } from '../../core/state.js';
import { DEPTS, deptById, WARN_AT } from '../../data/departments.js';
import { BODY_D, DECOR, ORGANS } from '../../art/shapes.js';
import { BODY_OFFSET, bodyPt } from './layout.js';

function drawBloodFlow() {
  noStroke();
  for (let i = 0; i < 26; i++) {
    const t = (millis() / 4000 + i / 26) % 1;
    const a = t * TWO_PI;
    fill(i % 3 === 0 ? 'rgba(80,120,190,0.55)' : 'rgba(217,68,58,0.55)');
    ellipse(300 + 92 * Math.sin(a), 330 + 150 * Math.cos(a), 6);
  }
}

function drawBody() {
  push();
  translate(4, 4);
  drawPath(BODY_D, null, 'rgba(43,76,140,0.18)', 3);
  pop();
  drawPath(BODY_D, C.skin, C.blue, 4);
  fill(C.skin);
  stroke(C.blue);
  strokeWeight(4);
  ellipse(300, 104, 100);
  drawShapes(DECOR);
}

function drawOrgans() {
  for (const d of DEPTS) {
    if (S.resent[d.id] >= WARN_AT) {
      const blink = (Math.sin(millis() / 180) + 1) / 2;
      noFill();
      stroke(`rgba(200,55,45,${0.35 + 0.5 * blink})`);
      strokeWeight(3);
      drawingContext.setLineDash([7, 5]);
      ellipse(d.center[0], d.center[1], d.id === 'muscle' ? 170 : 116, d.id === 'muscle' ? 120 : 86);
      drawingContext.setLineDash([]);
    }
    drawShapes(ORGANS[d.id]);
  }
}

function drawLabels() {
  for (const d of DEPTS) {
    txt(d.name, d.label[0], d.label[1], 22, C.ink, { font: HAND, bold: true });
    textFont(HAND);
    textSize(22);
    const w = textWidth(d.name);
    rbc(d.label[0] + w + 14, d.label[1] + 14, 7);
    txt(`×${S.tokens[d.id]}`, d.label[0] + w + 24, d.label[1] + 3, 18, C.ink, { font: HAND });
  }
}

function drawBubbles() {
  S.bubbles = S.bubbles.filter((b) => b.until > millis());
  for (const b of S.bubbles) {
    const [x, y] = bodyPt(deptById[b.dept].bubble);
    bubble(b.msg, x + 20, y, { size: 19, maxW: 250 });
  }
}

function drawCrisisPulse() {
  const [cx, cy] = bodyPt(deptById.immune.center);
  const pulse = 90 + 14 * Math.sin(millis() / 200);
  noFill();
  stroke(C.red);
  strokeWeight(4);
  ellipse(cx, cy, pulse, pulse * 0.8);
}

export function drawBodyMap() {
  txt('小晨的身體｜營運中', 80, 30, 26, C.blue, { font: HAND, bold: true });
  push();
  translate(BODY_OFFSET.x, BODY_OFFSET.y);
  drawBloodFlow();
  drawBody();
  drawOrgans();
  drawLabels();
  pop();
  drawBubbles();
  if (S.crisis) drawCrisisPulse();
}
