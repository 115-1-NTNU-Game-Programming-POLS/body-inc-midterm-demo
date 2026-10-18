import { W, H } from '../../ui/canvas.js';
import { C, HAND } from '../../ui/theme.js';
import { txt, sticky } from '../../ui/draw.js';
import { Btn } from '../../ui/button.js';
import { EVENT_CARD, chooseEventOption } from '../../rules/evening-event.js';

export function eventButtons() {
  return EVENT_CARD.options.map((opt, i) =>
    new Btn(opt.label, 400, 360 + i * 82, 480, 70, () => chooseEventOption(i), { sub: opt.sub, size: 24 }));
}

export function drawEventCard() {
  noStroke();
  fill('rgba(31,39,51,0.45)');
  rect(0, 0, W, H);
  sticky(340, 150, 600, 520, { angle: -0.012, shadow: 'rgba(0,0,0,0.18)', dx: 8, dy: 10, r: 6 });
  txt(EVENT_CARD.where, 380, 178, 22, C.red, { font: HAND });
  txt(EVENT_CARD.prompt, 380, 214, 32, C.ink, { font: HAND, bold: true });
  txt(EVENT_CARD.note, 380, 268, 17, C.soft);
}
