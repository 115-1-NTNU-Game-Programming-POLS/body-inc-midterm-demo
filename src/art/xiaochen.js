import { drawShapes } from '../ui/draw.js';
import { XC_BODY, XC_FACE_TIRED, XC_FACE_HAPPY, XC_FACE_SAD } from './shapes.js';

export const FACES = { tired: XC_FACE_TIRED, happy: XC_FACE_HAPPY, sad: XC_FACE_SAD };

export function drawXiaochen(x, y, s, face = 'tired') {
  push();
  translate(x, y);
  scale(s);
  drawShapes(XC_BODY);
  drawShapes(FACES[face]);
  pop();
}
