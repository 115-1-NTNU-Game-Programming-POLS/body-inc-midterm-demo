import { S } from '../core/state.js';
import { WARN_AT, QUIT_AT } from '../data/departments.js';

// Employee portraits by the team's artist; the art names the gut "intestine" and has no muscle-base.
const ICON_FILE = { brain: 'brain', immune: 'immune', liver: 'liver', stomach: 'stomach', gut: 'intestine', muscle: 'muscle' };
const ICONS = {};

// Call from p5's preload().
export function loadPortraits() {
  for (const [id, file] of Object.entries(ICON_FILE)) {
    ICONS[id] = {
      base: loadImage(`assets/organs/${file}-${id === 'muscle' ? 'normal' : 'base'}.png`),
      warning: loadImage(`assets/organs/${file}-warning.png`),
      quit: loadImage(`assets/organs/${file}-quit.png`),
    };
  }
}

export function moodOf(id) {
  const r = S.resent[id];
  return r >= QUIT_AT ? 'quit' : r >= WARN_AT ? 'warning' : 'base';
}

export function portrait(id, x, y, size, mood = moodOf(id)) {
  image(ICONS[id][mood], x, y, size, size);
}
