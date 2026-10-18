import { S } from './state.js';
import { emit } from './events.js';

// Sticky-note message at the top of the screen.
export function toast(msg, ms = 2600) {
  emit('toast');
  S.toasts.push({ msg, until: millis() + ms });
}

// Speech bubble next to a department on the body map; one bubble per department.
export function say(dept, msg, ms = 3200) {
  emit('say');
  S.bubbles = S.bubbles.filter((b) => b.dept !== dept);
  S.bubbles.push({ dept, msg, until: millis() + ms });
}
