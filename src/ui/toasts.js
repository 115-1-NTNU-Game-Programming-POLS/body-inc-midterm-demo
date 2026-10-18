import { S } from '../core/state.js';
import { C, HAND } from './theme.js';
import { card, txt } from './draw.js';

export function drawToasts() {
  S.toasts = S.toasts.filter((t) => t.until > millis());
  S.toasts.forEach((t, i) => {
    textFont(HAND);
    textSize(20);
    const w = Math.min(640, textWidth(t.msg) + 40);
    const x = 380 - w / 2;
    const y = 74 + i * 54;
    noStroke();
    fill('rgba(42,45,52,0.12)');
    rect(x + 4, y + 5, w, 44, 10);
    card(x, y, w, 44, C.sticky, C.ink, 2);
    txt(t.msg, x + w / 2, y + 23, 20, C.ink, { font: HAND, align: CENTER, valign: CENTER });
  });
}
