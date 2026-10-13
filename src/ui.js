// Logical canvas; the sketch is letterboxed and scaled to fit any screen.
const W = 1280;
const H = 720;
let SC = 1, OX = 0, OY = 0;

const C = {
  paper: '#FBF8EF', line: '#E2E9F1', margin: '#E8A09B', ink: '#2A2D34', soft: '#4A4F57', mute: '#5F646C',
  blue: '#2B4C8C', red: '#C8372D', darkRed: '#A12A21', yellow: '#FFE873', sticky: '#FFF1A8', green: '#2F6B3A',
  pinkBg: '#F8E1DE', greenBg: '#E6F0E4', white: '#FFFDF7', skin: '#FDF0E3', rbc: '#D9443A',
};
// p5 wraps the family name in quotes when it builds ctx.font, so pass one bare family name.
const HAND = 'LXGW WenKai TC';
const SANS = 'Noto Sans TC';

function fitCanvas() {
  SC = Math.min(windowWidth / W, windowHeight / H);
  OX = (windowWidth - W * SC) / 2;
  OY = (windowHeight - H * SC) / 2;
}

// p5's mouseX can be stale when a press arrives without a prior move (touch, or a click
// right after a keypress), so track the pointer ourselves; the canvas sits at the page origin.
let PX = 0, PY = 0;
for (const type of ['pointerdown', 'pointermove']) {
  window.addEventListener(type, (e) => { PX = e.clientX; PY = e.clientY; }, true);
}
function mx() { return (PX - OX) / SC; }
function my() { return (PY - OY) / SC; }

function paper() {
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

function txt(s, x, y, size, col, o = {}) {
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
function drawPath(d, fillC, strokeC, sw = 2) {
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
function drawShapes(list) {
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

function card(x, y, w, h, bg, border = C.ink, sw = 2.5) {
  fill(bg);
  stroke(border);
  strokeWeight(sw);
  rect(x, y, w, h, 16, 6, 18, 8);
}

function rbc(x, y, r = 9) {
  fill(C.rbc);
  stroke('#9E2A22');
  strokeWeight(1.5);
  ellipse(x, y, r * 2);
  noStroke();
  fill('#F08A80');
  ellipse(x, y, r * 0.9);
}

function emptyToken(x, y, r = 9) {
  noFill();
  stroke(C.rbc);
  strokeWeight(2);
  drawingContext.setLineDash([4, 3]);
  ellipse(x, y, r * 2);
  drawingContext.setLineDash([]);
}

function bubble(s, x, y, o = {}) {
  textFont(HAND);
  textSize(o.size || 20);
  const w = Math.min(o.maxW || 260, textWidth(s) + 28);
  const lines = Math.ceil((textWidth(s) + 28) / w);
  const h = lines * (o.size || 20) * 1.4 + 18;
  const left = o.left ? x - w : x;
  card(left, y - h, w, h, o.bg || C.white, o.border || C.ink, 2);
  txt(s, left + 14, y - h + 9, o.size || 20, o.col || C.ink, { font: HAND, w: w - 24 });
}

class Btn {
  constructor(label, x, y, w, h, onClick, o = {}) {
    Object.assign(this, { label, x, y, w, h, onClick, o });
  }
  hit() { return mx() >= this.x && mx() <= this.x + this.w && my() >= this.y && my() <= this.y + this.h; }
  draw() {
    const on = this.o.selected;
    const disabled = this.o.disabled && this.o.disabled();
    const hover = !disabled && this.hit();
    let bg = this.o.bg || C.white;
    if (on) bg = C.blue;
    if (disabled) bg = '#ECE8DD';
    fill(bg);
    stroke(disabled ? '#B9B3A6' : C.ink);
    strokeWeight(hover ? 3.5 : 2.5);
    rect(this.x, this.y, this.w, this.h, 14, 5, 16, 6);
    const col = disabled ? '#8A857A' : on || this.o.bg === C.blue || this.o.bg === C.red ? C.white : C.ink;
    txt(this.label, this.x + this.w / 2, this.y + this.h / 2 + (this.o.sub ? -9 : 1), this.o.size || 20, col,
      { font: this.o.font || HAND, bold: true, align: CENTER, valign: CENTER });
    if (this.o.sub) {
      txt(this.o.sub, this.x + this.w / 2, this.y + this.h - 6, 13, on ? '#DCE6F5' : C.mute, { align: CENTER, valign: BOTTOM });
    }
  }
  click() {
    if (this.o.disabled && this.o.disabled()) return false;
    if (this.hit()) { this.onClick(); return true; }
    return false;
  }
}
