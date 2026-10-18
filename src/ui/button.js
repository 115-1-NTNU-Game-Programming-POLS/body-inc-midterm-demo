import { mx, my } from './canvas.js';
import { C, HAND } from './theme.js';
import { txt } from './draw.js';
import { emit } from '../core/events.js';

export class Btn {
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
    if (this.hit()) { emit('ui:click'); this.onClick(); return true; }
    return false;
  }
}

// The buttons of the current screen. Scenes replace the whole set; the array is mutated in
// place so modules that imported it keep seeing the live list.
export const buttons = [];

export function setButtons(list) {
  buttons.length = 0;
  buttons.push(...list);
}

export function addButton(b) {
  buttons.push(b);
  return b;
}

export function clickButtons() {
  // Iterate a snapshot: a click handler may replace the set.
  for (const b of buttons.slice()) if (b.click()) return true;
  return false;
}

export function drawButtons() {
  for (const b of buttons) b.draw();
}
