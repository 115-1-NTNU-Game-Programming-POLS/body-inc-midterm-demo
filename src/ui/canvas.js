// Logical canvas; the sketch is letterboxed and scaled to fit any screen.
export const W = 1280;
export const H = 720;
export let SC = 1;
export let OX = 0;
export let OY = 0;

export function fitCanvas() {
  SC = Math.min(windowWidth / W, windowHeight / H);
  OX = (windowWidth - W * SC) / 2;
  OY = (windowHeight - H * SC) / 2;
}

// p5's mouseX can be stale when a press arrives without a prior move (touch, or a click
// right after a keypress), so track the pointer ourselves; the canvas sits at the page origin.
let PX = 0;
let PY = 0;
for (const type of ['pointerdown', 'pointermove']) {
  window.addEventListener(type, (e) => { PX = e.clientX; PY = e.clientY; }, true);
}
export function mx() { return (PX - OX) / SC; }
export function my() { return (PY - OY) / SC; }

export function inRect(r) { return mx() >= r.x && mx() <= r.x + r.w && my() >= r.y && my() <= r.y + r.h; }
