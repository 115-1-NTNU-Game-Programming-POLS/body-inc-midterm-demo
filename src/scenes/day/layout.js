// Screen geometry of the day scene, shared by drawing and hit-testing.
export const BODY_OFFSET = { x: 40, y: 60 };
export const PANEL_X = 740;

// Departments are laid out as a 3 x 2 grid of employee cards.
export function rowRect(i) { return { x: PANEL_X + (i % 3) * 170, y: 96 + Math.floor(i / 3) * 140, w: 160, h: 132 }; }
export function dotPos(i, k) { const r = rowRect(i); return [r.x + 18 + k * 20, r.y + 94]; }
export function poolDotPos(k) { return [PANEL_X + 120 + k * 24, 428]; }
export const POOL_RECT = { x: PANEL_X, y: 396, w: 500, h: 64 };

// Body-map coordinates (data/departments.js) to screen coordinates.
export function bodyPt(p) { return [p[0] + BODY_OFFSET.x, p[1] + BODY_OFFSET.y]; }
