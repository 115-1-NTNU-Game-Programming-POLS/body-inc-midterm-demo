import { W, H } from './canvas.js';
import { C, HAND, SANS } from './theme.js';

export function paper() {
  noStroke();
  fill(C.paper);
  rect(0, 0, W, H);
  stroke(C.line);
  strokeWeight(1.5);
  for (let y = 40; y < H; y += 32) line(0, y, W, y);
  stroke(C.margin);
  strokeWeight(2);
  line(48, 0, 48, H);
}

export function txt(s, x, y, size, col, o = {}) {
  noStroke();
  fill(col);
  textFont(o.font || SANS);
  textSize(size);
  textStyle(o.bold ? BOLD : NORMAL);
  textAlign(o.align || LEFT, o.valign || TOP);
  textLeading(o.leading || size * 1.5);
  if (o.w) {
    // p5 only breaks on spaces by default; Chinese needs CHAR wrapping.
    textWrap(CHAR);
    text(s, x, y, o.w, o.h || 2000);
  } else {
    text(s, x, y);
  }
}

const pathCache = {};
export function drawPath(d, fillC, strokeC, sw = 2) {
  const p = pathCache[d] || (pathCache[d] = new Path2D(d));
  const ctx = drawingContext;
  if (fillC) { ctx.fillStyle = fillC; ctx.fill(p); }
  if (strokeC) {
    ctx.strokeStyle = strokeC;
    ctx.lineWidth = sw;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke(p);
  }
}

// ['p', d, fill, stroke, width] or ['e', cx, cy, rx, ry, fill, stroke, width]
export function drawShapes(list) {
  for (const s of list) {
    if (s[0] === 'p') {
      drawPath(s[1], s[2], s[3], s[4]);
    } else {
      if (s[5]) fill(s[5]); else noFill();
      if (s[6]) { stroke(s[6]); strokeWeight(s[7] || 2); } else noStroke();
      ellipse(s[1], s[2], s[3] * 2, s[4] * 2);
    }
  }
}

export function card(x, y, w, h, bg, border = C.ink, sw = 2.5) {
  fill(bg);
  stroke(border);
  strokeWeight(sw);
  rect(x, y, w, h, 16, 6, 18, 8);
}

// Sticky note with a drop shadow. `inner` draws content in the note's own rotated frame,
// so text stays aligned with the paper. Pass `shadow: null` for a flat note.
export function sticky(x, y, w, h, o = {}) {
  const { angle = 0, shadow = 'rgba(42,45,52,0.12)', dx = 6, dy = 8, r = 4, inner } = o;
  push();
  translate(x, y);
  rotate(angle);
  noStroke();
  if (shadow) {
    fill(shadow);
    rect(dx, dy, w, h, r);
  }
  fill(C.sticky);
  rect(0, 0, w, h, r);
  inner?.();
  pop();
}

export function rbc(x, y, r = 9) {
  fill(C.rbc);
  stroke('#9E2A22');
  strokeWeight(1.5);
  ellipse(x, y, r * 2);
  noStroke();
  fill('#F08A80');
  ellipse(x, y, r * 0.9);
}

export function emptyToken(x, y, r = 9) {
  noFill();
  stroke(C.rbc);
  strokeWeight(2);
  drawingContext.setLineDash([4, 3]);
  ellipse(x, y, r * 2);
  drawingContext.setLineDash([]);
}

export function bubble(s, x, y, o = {}) {
  textFont(HAND);
  textSize(o.size || 20);
  const w = Math.min(o.maxW || 260, textWidth(s) + 28);
  const lines = Math.ceil((textWidth(s) + 28) / w);
  const h = lines * (o.size || 20) * 1.4 + 18;
  const left = o.left ? x - w : x;
  card(left, y - h, w, h, o.bg || C.white, o.border || C.ink, 2);
  txt(s, left + 14, y - h + 9, o.size || 20, o.col || C.ink, { font: HAND, w: w - 24 });
}
