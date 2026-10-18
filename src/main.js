// Entry point: wires p5's global-mode callbacks to the scene system.
// p5 looks for these on `window`, and module scripts run before the page's load event,
// which is when p5 starts, so assigning them here is in time.
import { W, H, OX, OY, SC, fitCanvas } from './ui/canvas.js';
import { C } from './ui/theme.js';
import { txt } from './ui/draw.js';
import { clickButtons } from './ui/button.js';
import { drawToasts } from './ui/toasts.js';
import { drawMuteButton, pressMuteButton } from './ui/mute-button.js';
import { S } from './core/state.js';
import { currentScene, newGame } from './core/scenes.js';
import { loadPortraits } from './art/portraits.js';
import { loadBrand } from './art/brand.js';
import { installAudioUnlock, toggleMute } from './audio/mixer.js';
import { installMusic } from './audio/music.js';
import { installCues } from './audio/cues.js';
import './scenes/title.js';
import './scenes/morning.js';
import './scenes/day/index.js';
import './scenes/night.js';
import './scenes/report.js';
import './scenes/handbook.js';

installAudioUnlock();
installMusic();
installCues();

window.preload = () => {
  loadPortraits();
  loadBrand();
};

window.setup = () => {
  createCanvas(windowWidth, windowHeight);
  fitCanvas();
  newGame();
};

window.windowResized = () => {
  resizeCanvas(windowWidth, windowHeight);
  fitCanvas();
};

window.draw = () => {
  background(C.stage);
  push();
  translate(OX, OY);
  scale(SC);
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, W, H);
  drawingContext.clip();
  currentScene().draw();
  drawToasts();
  txt('→ 下一步　R 重來　M 聲音', 60, H - 12, 13, C.hint, { valign: BOTTOM });
  drawMuteButton();
  drawingContext.restore();
  pop();
};

// Returning false stops p5 from also firing the browser's default action (scroll, zoom).
window.mousePressed = () => {
  if (pressMuteButton()) return false;
  if (currentScene().press?.()) return false;
  clickButtons();
  return false;
};

window.mouseReleased = () => {
  currentScene().release?.();
  return false;
};

window.touchMoved = () => false;

window.keyPressed = () => {
  if (key === 'r' || key === 'R') newGame();
  else if (keyCode === RIGHT_ARROW || keyCode === ENTER || key === ' ') currentScene().skip?.();
  else if (key === '1' || key === '2' || key === '3') S.speed = Number(key);
  else if (key === 'm' || key === 'M') toggleMute();
};
