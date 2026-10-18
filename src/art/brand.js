// Team logo: a company seal with a blood-cell employee (see README, 美術).
let badge = null;

// Call from p5's preload().
export function loadBrand() {
  badge = loadImage('assets/brand/badge-512.png');
}

export function drawBadge(x, y, size, angle = 0) {
  push();
  translate(x + size / 2, y + size / 2);
  rotate(angle);
  image(badge, -size / 2, -size / 2, size, size);
  pop();
}
