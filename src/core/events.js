// Minimal pub/sub so game rules can announce what happened without knowing who reacts
// (sound cues today; analytics or animations could subscribe the same way).
const handlers = {};

export function on(name, fn) {
  (handlers[name] ||= []).push(fn);
}

export function emit(name, data) {
  for (const fn of handlers[name] || []) fn(data);
}
