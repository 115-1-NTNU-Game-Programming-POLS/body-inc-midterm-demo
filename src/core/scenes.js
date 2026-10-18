import { S, resetState } from './state.js';
import { emit } from './events.js';
import { setButtons } from '../ui/button.js';

// Each scene module registers itself here; a scene is { enter?, draw, press?, release?, skip? }.
const SCENES = {};

export function registerScene(name, scene) {
  SCENES[name] = scene;
}

export function currentScene() {
  return SCENES[S.scene];
}

export function enter(name) {
  S.scene = name;
  S.enteredAt = millis();
  S.toasts = [];
  setButtons([]);
  SCENES[name].enter?.();
  emit('scene:enter', name);
}

export function newGame() {
  resetState();
  enter('title');
}
