import { W, H, inRect } from './canvas.js';
import { C } from './theme.js';
import { mixer, toggleMute } from '../audio/mixer.js';

// Bottom-right corner, clear of the day screen's marquee (which ends at x = 1240).
const BOX = { x: W - 36, y: H - 42, w: 32, h: 32 };

export function drawMuteButton() {
  const { x, y, w, h } = BOX;
  fill(inRect(BOX) ? C.sticky : C.white);
  stroke(C.ink);
  strokeWeight(2);
  rect(x, y, w, h, 8);
  noStroke();
  fill(C.ink);
  rect(x + 7, y + 12, 5, 8);
  quad(x + 11, y + 12, x + 18, y + 6, x + 18, y + 26, x + 11, y + 20);
  noFill();
  stroke(mixer.muted ? C.red : C.ink);
  strokeWeight(2);
  if (mixer.muted) {
    line(x + 21, y + 11, x + 28, y + 21);
    line(x + 28, y + 11, x + 21, y + 21);
  } else {
    arc(x + 18, y + 16, 10, 12, -HALF_PI * 0.8, HALF_PI * 0.8);
    arc(x + 18, y + 16, 18, 20, -HALF_PI * 0.8, HALF_PI * 0.8);
  }
}

// Returns true when the press was handled.
export function pressMuteButton() {
  if (!inRect(BOX)) return false;
  toggleMute();
  return true;
}
