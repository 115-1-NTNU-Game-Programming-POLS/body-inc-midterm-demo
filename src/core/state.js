// The whole mutable game state. Exported as one object that is reset in place, so every
// module that imported `S` keeps pointing at the current run.
export const S = {};

function initialState() {
  return {
    scene: 'title', enteredAt: 0,
    ch: { breakfast: null, afternoon: null, evening: null, bed: null },
    tokens: { brain: 2, immune: 1, liver: 1, stomach: 1, gut: 1, muscle: 1 },
    pool: 5,
    resent: { brain: 40, immune: 55, liver: 35, stomach: 20, gut: 15, muscle: 25 },
    debt: 2.5, stress: 58, social: 4, progress: 20,
    hour: 7, speed: 1, done: {}, toasts: [], bubbles: [],
    marquee: '公司快訊：期中考前一天，董事長宣布全員加班。',
    crisis: null, event: null, drag: null, flags: {}, sleepFactors: [], night: null,
  };
}

export function resetState() {
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, initialState());
}
