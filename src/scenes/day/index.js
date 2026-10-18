import { mx, my, inRect } from '../../ui/canvas.js';
import { SANS } from '../../ui/theme.js';
import { paper, rbc } from '../../ui/draw.js';
import { Btn, buttons, setButtons, drawButtons } from '../../ui/button.js';
import { registerScene, enter } from '../../core/scenes.js';
import { S } from '../../core/state.js';
import { emit } from '../../core/events.js';
import { toast } from '../../core/feedback.js';
import { DEPTS, deptById } from '../../data/departments.js';
import { advanceClock, dayOver, skipAhead } from '../../rules/timeline.js';
import { moveToken, borrowNightShift, ignoreCrisis, autoResolveCrisis } from '../../rules/crisis.js';
import { chooseEventOption } from '../../rules/evening-event.js';
import { drawBodyMap } from './body-map.js';
import { drawPanel } from './panel.js';
import { drawEventCard, eventButtons } from './event-card.js';
import { PANEL_X, rowRect, dotPos, poolDotPos, POOL_RECT, bodyPt } from './layout.js';

const TOKEN_HIT_R = 13;
const DROP_R = 80;

function speedButtons() {
  return [1, 2, 3].map((n, i) => {
    const b = new Btn(`${n}×`, PANEL_X + 336 + i * 54, 34, 46, 38, () => { S.speed = n; }, { size: 18, font: SANS });
    b.speedN = n;
    return b;
  });
}

function crisisButtons() {
  const bx = PANEL_X + 20;
  return [
    new Btn('向夜班借調 +2', bx, 584, 220, 46, borrowNightShift,
      { size: 19, disabled: () => S.crisis && S.crisis.borrowed }),
    new Btn('暫不處理', bx + 240, 584, 220, 46, ignoreCrisis, { size: 19 }),
  ];
}

// The button set follows the day's mode; rebuild it only when the mode changes so hover
// and selection state survive between frames.
let mode = null;
function syncButtons() {
  const next = S.event ? 'event' : S.crisis ? 'crisis' : 'normal';
  if (next === mode) return;
  mode = next;
  if (mode === 'event') setButtons(eventButtons());
  else if (mode === 'crisis') setButtons([...crisisButtons(), ...speedButtons()]);
  else setButtons(speedButtons());
}

function pressOutsideCrisis() {
  const onToken = DEPTS.some((d, i) => S.tokens[d.id] > 0 && inRect(rowRect(i)) && mx() > PANEL_X + 90)
    || inRect(POOL_RECT);
  if (onToken && !S.flags.hintedDrag) {
    S.flags.hintedDrag = true;
    toast('缺人手時待命池會自動補上；不夠時才會暫停，讓你調度');
  }
}

function startDrag(from) {
  S.drag = { from };
  emit('token:pick', from);
  return true;
}

registerScene('day', {
  enter() {
    mode = null;
    syncButtons();
  },
  draw() {
    advanceClock(deltaTime / 1000);
    if (dayOver()) { enter('night'); return; }
    syncButtons();
    paper();
    drawBodyMap();
    drawPanel();
    for (const b of buttons) if (b.speedN) b.o.selected = S.speed === b.speedN;
    if (S.drag) rbc(mx(), my(), 12);
    if (S.event) drawEventCard();
    drawButtons();
  },
  press() {
    if (S.event) return false;
    if (!S.crisis) { pressOutsideCrisis(); return false; }
    for (let k = 0; k < S.pool; k++) {
      if (dist(mx(), my(), ...poolDotPos(k)) < TOKEN_HIT_R) return startDrag('pool');
    }
    for (let i = 0; i < DEPTS.length; i++) {
      const id = DEPTS[i].id;
      if (id === 'immune') continue;
      for (let k = 0; k < S.tokens[id]; k++) {
        if (dist(mx(), my(), ...dotPos(i, k)) < TOKEN_HIT_R) return startDrag(id);
      }
    }
    return false;
  },
  release() {
    if (!S.drag || !S.crisis) { S.drag = null; return; }
    const immuneIdx = DEPTS.findIndex((d) => d.id === 'immune');
    const [cx, cy] = bodyPt(deptById.immune.center);
    if (inRect(rowRect(immuneIdx)) || dist(mx(), my(), cx, cy) < DROP_R) moveToken(S.drag.from);
    else emit('token:miss');
    S.drag = null;
  },
  skip() {
    if (S.event) chooseEventOption(0);
    else if (S.crisis) autoResolveCrisis();
    else skipAhead();
  },
});
