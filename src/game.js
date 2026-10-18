// Scripted one-day demo for the midterm proposal. Numbers are illustrative;
// the sleep, study and exam formulas follow the design doc so the trade-offs read correctly.

const SEC_PER_HOUR = 1.5;
const BODY_OFFSET = { x: 40, y: 60 };

const DEPTS = [
  { id: 'brain', name: '大腦', center: [300, 104], label: [146, 84], bubble: [352, 70] },
  { id: 'immune', name: '免疫', center: [300, 224], label: [92, 214], bubble: [330, 200] },
  { id: 'liver', name: '肝', center: [262, 318], label: [100, 300], bubble: [420, 350] },
  { id: 'stomach', name: '胃', center: [348, 330], label: [444, 300], bubble: [380, 310] },
  { id: 'gut', name: '腸道菌', center: [300, 410], label: [452, 380], bubble: [350, 392] },
  { id: 'muscle', name: '肌肉', center: [300, 530], label: [104, 520], bubble: [372, 500] },
];
const deptById = Object.fromEntries(DEPTS.map((d) => [d.id, d]));

const CHOICES = {
  breakfast: [
    { id: 'eat', label: '蛋餅加豆漿', sub: '胃先開工' },
    { id: 'skip', label: '不吃，多睡一下', sub: '肝要加班撐血糖' },
  ],
  afternoon: [
    { id: 'study', label: '讀書', sub: '大腦 +2 枚代幣', brain: 2 },
    { id: 'club', label: '社團練習', sub: '社交 +2' },
    { id: 'nap', label: '午睡 20 分鐘', sub: '補一點精神' },
  ],
  evening: [
    { id: 'study', label: '讀書', sub: '大腦 +1 枚代幣', brain: 1 },
    { id: 'exercise', label: '運動', sub: '肌肉 +1 枚代幣', muscle: 1 },
    { id: 'chat', label: '跟室友聊天', sub: '社交 +2' },
  ],
  bed: [
    { id: 23, label: '23:00', sub: '睡 8 小時' },
    { id: 25, label: '01:00', sub: '睡 6 小時' },
    { id: 27, label: '03:00', sub: '睡 4 小時' },
  ],
};

let S;
let buttons = [];

function newGame() {
  S = {
    scene: 'title', enteredAt: millis(),
    ch: { breakfast: null, afternoon: null, evening: null, bed: null },
    tokens: { brain: 2, immune: 1, liver: 1, stomach: 1, gut: 1, muscle: 1 },
    pool: 5,
    resent: { brain: 40, immune: 55, liver: 35, stomach: 20, gut: 15, muscle: 25 },
    debt: 2.5, stress: 58, social: 4, progress: 20,
    hour: 7, speed: 1, done: {}, toasts: [], bubbles: [],
    marquee: '公司快訊：期中考前一天，董事長宣布全員加班。',
    crisis: null, event: null, drag: null, flags: {}, sleepFactors: [], night: null,
  };
  enter('title');
}

function enter(scene) {
  S.scene = scene;
  S.enteredAt = millis();
  S.toasts = [];
  buttons = [];
  SCENES[scene].enter?.();
}

// Employee portraits by the team's artist; the art names the gut "intestine" and has no muscle-base.
const ICON_FILE = { brain: 'brain', immune: 'immune', liver: 'liver', stomach: 'stomach', gut: 'intestine', muscle: 'muscle' };
const ICONS = {};

function preload() {
  for (const [id, file] of Object.entries(ICON_FILE)) {
    ICONS[id] = {
      base: loadImage(`assets/organs/${file}-${id === 'muscle' ? 'normal' : 'base'}.png`),
      warning: loadImage(`assets/organs/${file}-warning.png`),
      quit: loadImage(`assets/organs/${file}-quit.png`),
    };
  }
}

function moodOf(id) {
  const r = S.resent[id];
  return r >= 85 ? 'quit' : r >= 60 ? 'warning' : 'base';
}

function portrait(id, x, y, size, mood = moodOf(id)) {
  image(ICONS[id][mood], x, y, size, size);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fitCanvas();
  newGame();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  fitCanvas();
}

function draw() {
  background('#1F2733');
  push();
  translate(OX, OY);
  scale(SC);
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, W, H);
  drawingContext.clip();
  SCENES[S.scene].draw();
  drawToasts();
  txt('→ 下一步　R 重來　M 聲音', 60, H - 12, 13, '#9A958A', { valign: BOTTOM });
  drawMuteButton();
  drawingContext.restore();
  pop();
}

function mousePressed() {
  if (muteButtonHit()) { toggleMute(); return false; }
  const sc = SCENES[S.scene];
  if (sc.press && sc.press()) return false;
  for (const b of buttons) if (b.click()) return false;
  return false;
}
function mouseReleased() { SCENES[S.scene].release?.(); return false; }
function touchMoved() { return false; }

function keyPressed() {
  if (key === 'r' || key === 'R') newGame();
  else if (keyCode === RIGHT_ARROW || keyCode === ENTER || key === ' ') SCENES[S.scene].skip?.();
  else if (key === '1' || key === '2' || key === '3') S.speed = Number(key);
  else if (key === 'm' || key === 'M') toggleMute();
}

function toast(msg, ms = 2600) { sfx('pop'); S.toasts.push({ msg, until: millis() + ms }); }
function say(dept, msg, ms = 3200) {
  sfx('blip');
  S.bubbles = S.bubbles.filter((b) => b.dept !== dept);
  S.bubbles.push({ dept, msg, until: millis() + ms });
}

function drawToasts() {
  S.toasts = S.toasts.filter((t) => t.until > millis());
  S.toasts.forEach((t, i) => {
    textFont(HAND);
    textSize(20);
    const w = Math.min(640, textWidth(t.msg) + 40);
    const x = 380 - w / 2;
    const y = 74 + i * 54;
    noStroke();
    fill('rgba(42,45,52,0.12)');
    rect(x + 4, y + 5, w, 44, 10);
    card(x, y, w, 44, C.sticky, C.ink, 2);
    txt(t.msg, x + w / 2, y + 23, 20, C.ink, { font: HAND, align: CENTER, valign: CENTER });
  });
}

function drawXiaochen(x, y, s, face = XC_FACE_TIRED) {
  push();
  translate(x, y);
  scale(s);
  drawShapes(XC_BODY);
  drawShapes(face);
  pop();
}

function clock(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h % 1) * 60 / 10) * 10;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function sFactor(debt) { return Math.max(0.3, 1 - 0.07 * debt); }

/* ---------------- title ---------------- */

const SCENES = {};

SCENES.title = {
  enter() {
    buttons.push(new Btn('開始：第 4 天早上 →', 96, 520, 300, 66, () => enter('morning'), { bg: C.blue, size: 24 }));
  },
  draw() {
    paper();
    txt('遊戲程式設計 115-1｜第七組｜期中提案展示版', 96, 96, 22, C.red, { font: HAND });
    txt('人體股份\n有限公司', 92, 138, 104, C.blue, { font: HAND, bold: true, leading: 116 });
    noStroke();
    fill(C.yellow);
    rect(92, 422, 520, 18);
    txt('把一學期濃縮成十天，撐到期末考。', 96, 398, 32, C.ink, { font: HAND });
    txt('畫面流程原型：流程照腳本走，數值為示意。', 96, 464, 18, C.mute);
    buttons.forEach((b) => b.draw());
    txt('公司員工', 96, 610, 18, C.red, { font: HAND });
    DEPTS.forEach((d, i) => portrait(d.id, 180 + i * 70, 594, 66, 'base'));
    drawXiaochen(800, 150, 0.95);
    bubble('明天就期中考了……', 896, 250, { size: 22, left: true });
    txt(`音樂：${TRACKS.map((t) => t.title).join('、')}，Kevin MacLeod（incompetech.com），CC BY 4.0`,
      W - 48, H - 12, 13, '#9A958A', { align: RIGHT, valign: BOTTOM });
  },
  skip() { enter('morning'); },
};

/* ---------------- morning planning ---------------- */

function freePool() {
  const a = CHOICES.afternoon.find((c) => c.id === S.ch.afternoon) || {};
  const e = CHOICES.evening.find((c) => c.id === S.ch.evening) || {};
  return 5 - (a.brain || 0) - (e.brain || 0) - (e.muscle || 0);
}

SCENES.morning = {
  enter() {
    const rows = [['breakfast', 150], ['afternoon', 300], ['evening', 400], ['bed', 500]];
    for (const [key, y] of rows) {
      CHOICES[key].forEach((c, i) => {
        const b = new Btn(c.label, 620 + i * 210, y, 194, 70, () => {
          S.ch[key] = c.id;
          buttons.filter((x) => x.group === key).forEach((x) => { x.o.selected = x.choice === c.id; });
        }, { sub: c.sub, size: 22 });
        b.group = key;
        b.choice = c.id;
        buttons.push(b);
      });
    }
    buttons.push(new Btn('開始這一天 →', 940, 616, 274, 62, () => startDay(),
      { bg: C.blue, size: 24, disabled: () => Object.values(S.ch).some((v) => v === null) }));
  },
  draw() {
    paper();
    txt('第 4 天（四）早上 07:00', 96, 44, 22, C.red, { font: HAND });
    txt('今天怎麼過？期中考就在明天', 96, 74, 40, C.blue, { font: HAND, bold: true });
    // status sticky
    push();
    translate(96, 150);
    rotate(-0.02);
    noStroke();
    fill('rgba(42,45,52,0.12)');
    rect(6, 8, 380, 220, 4);
    fill(C.sticky);
    rect(0, 0, 380, 220, 4);
    txt('小晨的狀態', 24, 18, 26, C.red, { font: HAND, bold: true });
    const rows = [['睡眠債', `${S.debt} 小時`], ['壓力', `${S.stress} / 100`], ['社交', `${S.social} / 10`], ['學業進度', `${S.progress} 點`]];
    rows.forEach(([k, v], i) => {
      txt(k, 24, 62 + i * 36, 22, C.soft, { font: HAND });
      txt(v, 356, 62 + i * 36, 22, C.ink, { font: HAND, bold: true, align: RIGHT });
    });
    pop();
    drawXiaochen(150, 392, 0.52);
    // choice rows
    const label = (s, y) => txt(s, 486, y + 35, 26, C.ink, { font: HAND, bold: true, valign: CENTER });
    label('早餐', 150);
    label('上午', 219);
    card(620, 228, 404, 52, '#ECE8DD', '#B9B3A6', 2);
    txt('上課（必修，不能翹）', 822, 255, 20, C.mute, { font: HAND, align: CENTER, valign: CENTER });
    label('下午', 300);
    label('晚上', 400);
    label('幾點睡', 500);
    buttons.forEach((b) => b.draw());
    const pool = freePool();
    txt(`待命池剩 ${pool} 枚：越少，越容易爆發調度危機`, 486, 604, 19, pool <= 2 ? C.red : C.soft, { font: HAND });
    txt('考試分數會依考試當天的睡眠打折', 486, 640, 19, C.soft, { font: HAND });
  },
  skip() {
    Object.assign(S.ch, { breakfast: S.ch.breakfast ?? 'skip', afternoon: S.ch.afternoon ?? 'study', evening: S.ch.evening ?? 'study', bed: S.ch.bed ?? 25 });
    startDay();
  },
};

function startDay() {
  const a = CHOICES.afternoon.find((c) => c.id === S.ch.afternoon);
  const e = CHOICES.evening.find((c) => c.id === S.ch.evening);
  S.tokens.brain += (a.brain || 0) + (e.brain || 0);
  S.tokens.muscle += e.muscle || 0;
  S.pool = freePool();
  enter('day');
}

/* ---------------- daytime ---------------- */

const PANEL_X = 740;
const ROW_Y = 100;
const ROW_H = 46;

// Departments are laid out as a 3 x 2 grid of employee cards.
function rowRect(i) { return { x: PANEL_X + (i % 3) * 170, y: 96 + Math.floor(i / 3) * 140, w: 160, h: 132 }; }
function dotPos(i, k) { const r = rowRect(i); return [r.x + 18 + k * 20, r.y + 94]; }
function poolDotPos(k) { return [PANEL_X + 120 + k * 24, 428]; }
function inRect(r) { return mx() >= r.x && mx() <= r.x + r.w && my() >= r.y && my() <= r.y + r.h; }
function bodyPt(p) { return [p[0] + BODY_OFFSET.x, p[1] + BODY_OFFSET.y]; }

function beat(id, cond, fn) {
  // A crisis or event card pauses the clock; later beats wait until it is resolved.
  if (S.crisis || S.event || S.scene !== 'day') return;
  if (!S.done[id] && cond) { S.done[id] = true; fn(); }
}

function runBeats() {
  const h = S.hour;
  beat('b8', h >= 8, () => {
    if (S.ch.breakfast === 'skip') {
      say('liver', '（空腹……默默釋放葡萄糖撐住血糖）');
      S.resent.liver += 5;
      S.marquee = '肝臟部門自動加班：沒吃早餐時，由肝臟釋放葡萄糖維持血糖。';
    } else {
      say('stomach', '早餐收到，開工！');
      S.marquee = '物流主管胃：蛋餅與豆漿已入庫。';
    }
  });
  beat('b9', h >= 9.2, () => { S.marquee = '上課中：大腦部門全力運轉。'; });
  beat('b10', h >= 10.5, () => {
    say('immune', '喉嚨有點癢……', 4200);
    S.marquee = '早期症狀：免疫部開始抱怨了。徵兆出現時處理，才不會惡化。';
  });
  beat('b12', h >= 12.5, () => {
    const n = Math.min(2, S.pool);
    S.pool -= n;
    S.tokens.stomach += n;
    S.flags.lunch = n;
    toast(n === 2 ? '午餐：胃要 2 枚代幣，待命池自動補上，時間不暫停' : '午餐：待命池不夠，胃只補到一部分');
  });
  beat('b13', h >= 13.4, () => {
    if (S.ch.afternoon === 'study') { S.marquee = '下午讀書中：大腦加派人手，讀書效率提升。'; }
    else if (S.ch.afternoon === 'club') { S.social += 2; S.marquee = '社團練習中：社交 +2。'; }
    else { S.debt = Math.max(0, S.debt - 0.3); say('brain', '小睡 20 分鐘，腦袋清楚一點了'); }
  });
  beat('b14', h >= 14, () => startCrisis());
  beat('b15', h >= 15.2, () => {
    const n = S.flags.lunch || 0;
    if (n) {
      S.tokens.stomach -= n;
      S.pool += n;
      toast('胃部消化完成，代幣歸還待命池');
    }
  });
  beat('b19', h >= 19, () => startEvent());
  beat('b21', h >= 21, () => {
    if (S.ch.evening === 'study') { say('brain', '同一行字看了三次……'); S.marquee = '睡眠債的徵兆：注意力開始下降。'; }
    else if (S.ch.evening === 'exercise') { S.stress -= 8; say('muscle', '動一動，壓力下降了！'); }
    else { S.social += 2; S.stress -= 5; S.marquee = '和室友聊天：社交 +2，壓力下降。'; }
  });
  beat('b23', h >= 23.05 && S.ch.bed > 23, () => {
    S.marquee = '超過 23:00：小晨還在熬夜，大腦部門加班中。';
    say('brain', '再讀一小時就睡……');
  });
  if (h >= S.ch.bed && !S.crisis && !S.event) enter('night');
}

function startCrisis() {
  S.hour = 14;
  const need = Math.max(2, S.pool + 1);
  S.crisis = { target: S.tokens.immune + need, need, moved: [], borrowed: false };
  sfx('alarm');
  S.marquee = '調度危機！室友在宿舍狂咳，免疫部要求增援。';
  say('immune', '病毒來了，人手不夠！', 6000);
  const bx = PANEL_X + 20;
  buttons = [
    new Btn('向夜班借調 +2', bx, 584, 220, 46, () => {
      if (S.crisis.borrowed) return;
      S.crisis.borrowed = true;
      S.pool += 2;
      S.sleepFactors.push(['向夜班借調', 0.7]);
      toast('夜班借來 2 枚，直接派去免疫部；代價是今晚睡眠效率 ×0.7');
      // Borrowed staff go straight to the department in trouble.
      for (let k = 0; k < 2 && S.crisis && S.pool > 0; k++) moveToken('pool');
    }, { size: 19, disabled: () => S.crisis && S.crisis.borrowed }),
    new Btn('暫不處理', bx + 240, 584, 220, 46, () => {
      S.flags.crisis = 'ignore';
      S.resent.immune = Math.min(100, S.resent.immune + 25);
      say('immune', '人手不夠……快撐不住了');
      endCrisis();
    }, { size: 19 }),
  ];
  speedButtons();
}

function endCrisis() {
  S.crisis = null;
  buttons = [];
  speedButtons();
  sfx(S.flags.crisis === 'ignore' ? 'bad' : 'good');
  toast(S.flags.crisis === 'ignore' ? '免疫部的缺口沒補上，怨氣大增' : '危機解除，時間繼續');
}

function moveToken(from) {
  if (from === 'pool') {
    if (S.pool <= 0) return;
    S.pool -= 1;
  } else {
    if (from === 'brain' && S.tokens.brain <= 2) { toast('大腦固定保障 2 枚，不能挪'); return; }
    if (S.tokens[from] <= 0) return;
    S.tokens[from] -= 1;
    S.resent[from] = Math.min(100, S.resent[from] + 10);
    say(from, from === 'brain' ? '我的專注力預算呢？' : '人被挪走了，工作做不完！');
  }
  S.tokens.immune += 1;
  sfx('drop');
  S.crisis.moved.push(from);
  if (S.tokens.immune >= S.crisis.target) {
    S.flags.crisis = S.crisis.moved.includes('brain') ? 'brain'
      : S.crisis.moved.some((m) => m !== 'pool') ? 'other' : S.crisis.borrowed ? 'borrow' : 'pool';
    if (S.crisis.borrowed && S.flags.crisis === 'pool') S.flags.crisis = 'borrow';
    endCrisis();
  }
}

function startEvent() {
  S.hour = 19;
  S.event = true;
  sfx('card');
  const opts = [
    ['走啊！', '社交 +2｜胃要上夜班，睡眠效率 ×0.9', () => { S.social += 2; S.flags.snack = true; S.sleepFactors.push(['宵夜', 0.9]); }],
    ['不了，我要睡', '社交 −1｜壓力 +5', () => { S.social -= 1; S.stress += 5; }],
    ['幫我帶一份', '社交 +1｜胃要上夜班，睡眠效率 ×0.9', () => { S.social += 1; S.flags.snack = true; S.sleepFactors.push(['宵夜', 0.9]); }],
  ];
  buttons = opts.map(([label, sub, fn], i) => new Btn(label, 400, 360 + i * 82, 480, 70, () => {
    fn();
    S.event = null;
    toast(`你選了「${label}」：${sub}`, 3200);
    if (S.flags.snack) say('stomach', '又要上夜班？！');
    buttons = [];
    speedButtons();
  }, { sub, size: 24 }));
}

function speedButtons() {
  [1, 2, 3].forEach((n, i) => {
    const b = new Btn(`${n}×`, PANEL_X + 336 + i * 54, 34, 46, 38, () => { S.speed = n; }, { size: 18, font: SANS });
    b.speedN = n;
    buttons.push(b);
  });
}

SCENES.day = {
  enter() { speedButtons(); },
  draw() {
    const paused = S.crisis || S.event;
    if (!paused) {
      S.hour += (deltaTime / 1000) * S.speed / SEC_PER_HOUR;
      runBeats();
      if (S.scene !== 'day') return;
    }
    paper();
    drawBodyMap();
    drawPanel();
    buttons.filter((b) => b.speedN).forEach((b) => { b.o.selected = S.speed === b.speedN; });
    if (S.drag) {
      rbc(mx(), my(), 12);
    }
    if (S.event) drawEventCard();
    buttons.forEach((b) => {
      if (S.event && b.speedN) return;
      b.draw();
    });
  },
  press() {
    if (S.event) return false;
    if (!S.crisis) {
      const hitDot = DEPTS.some((d, i) => S.tokens[d.id] > 0 && dist(mx(), my(), ...dotPos(i, 0)) < 300 && inRect(rowRect(i)) && mx() > PANEL_X + 90)
        || inRect({ x: PANEL_X, y: 396, w: 500, h: 64 });
      if (hitDot && !S.flags.hintedDrag) {
        S.flags.hintedDrag = true;
        toast('缺人手時待命池會自動補上；不夠時才會暫停，讓你調度');
      }
      return false;
    }
    for (let k = 0; k < S.pool; k++) {
      if (dist(mx(), my(), ...poolDotPos(k)) < 13) { S.drag = { from: 'pool' }; sfx('pick'); return true; }
    }
    for (let i = 0; i < DEPTS.length; i++) {
      const id = DEPTS[i].id;
      if (id === 'immune') continue;
      for (let k = 0; k < S.tokens[id]; k++) {
        if (dist(mx(), my(), ...dotPos(i, k)) < 13) { S.drag = { from: id }; sfx('pick'); return true; }
      }
    }
    return false;
  },
  release() {
    if (!S.drag || !S.crisis) { S.drag = null; return; }
    const immuneIdx = DEPTS.findIndex((d) => d.id === 'immune');
    const [cx, cy] = bodyPt(deptById.immune.center);
    if (inRect(rowRect(immuneIdx)) || dist(mx(), my(), cx, cy) < 80) moveToken(S.drag.from);
    else sfx('miss');
    S.drag = null;
  },
  skip() {
    if (S.event) { buttons[0].onClick(); return; }
    if (S.crisis) {
      while (S.crisis) {
        const from = S.pool > 0 ? 'pool' : S.tokens.brain > 2 ? 'brain'
          : DEPTS.map((d) => d.id).find((id) => id !== 'immune' && id !== 'brain' && S.tokens[id] > 0);
        if (!from) { S.flags.crisis = 'ignore'; endCrisis(); break; }
        moveToken(from);
      }
      return;
    }
    const next = [8, 10.5, 12.5, 14, 19, S.ch.bed].find((t) => t > S.hour + 0.01);
    S.hour = next ?? S.ch.bed;
  },
};

function drawBodyMap() {
  txt('小晨的身體｜營運中', 80, 30, 26, C.blue, { font: HAND, bold: true });
  push();
  translate(BODY_OFFSET.x, BODY_OFFSET.y);
  // blood flow particles along a loop through the torso
  noStroke();
  for (let i = 0; i < 26; i++) {
    const t = (millis() / 4000 + i / 26) % 1;
    const a = t * TWO_PI;
    fill(i % 3 === 0 ? 'rgba(80,120,190,0.55)' : 'rgba(217,68,58,0.55)');
    ellipse(300 + 92 * Math.sin(a), 330 + 150 * Math.cos(a), 6);
  }
  push();
  translate(4, 4);
  drawPath(BODY_D, null, 'rgba(43,76,140,0.18)', 3);
  pop();
  drawPath(BODY_D, C.skin, C.blue, 4);
  fill(C.skin);
  stroke(C.blue);
  strokeWeight(4);
  ellipse(300, 104, 100);
  drawShapes(DECOR);
  for (const d of DEPTS) {
    const r = S.resent[d.id];
    if (r >= 60) {
      const blink = (Math.sin(millis() / 180) + 1) / 2;
      noFill();
      stroke(`rgba(200,55,45,${0.35 + 0.5 * blink})`);
      strokeWeight(3);
      drawingContext.setLineDash([7, 5]);
      ellipse(d.center[0], d.center[1], d.id === 'muscle' ? 170 : 116, d.id === 'muscle' ? 120 : 86);
      drawingContext.setLineDash([]);
    }
    drawShapes(ORGANS[d.id]);
  }
  for (const d of DEPTS) {
    txt(d.name, d.label[0], d.label[1], 22, C.ink, { font: HAND, bold: true });
    textFont(HAND);
    textSize(22);
    const w = textWidth(d.name);
    rbc(d.label[0] + w + 14, d.label[1] + 14, 7);
    txt(`×${S.tokens[d.id]}`, d.label[0] + w + 24, d.label[1] + 3, 18, C.ink, { font: HAND });
  }
  pop();
  S.bubbles = S.bubbles.filter((b) => b.until > millis());
  for (const b of S.bubbles) {
    const [x, y] = bodyPt(deptById[b.dept].bubble);
    bubble(b.msg, x + 20, y, { size: 19, maxW: 250 });
  }
  if (S.crisis) {
    const [cx, cy] = bodyPt(deptById.immune.center);
    const pulse = 90 + 14 * Math.sin(millis() / 200);
    noFill();
    stroke(C.red);
    strokeWeight(4);
    ellipse(cx, cy, pulse, pulse * 0.8);
  }
}

function drawPanel() {
  card(PANEL_X, 20, 500, 64, C.white);
  txt('第 4 天（四）', PANEL_X + 20, 36, 20, C.red, { font: HAND });
  txt(clock(S.hour), PANEL_X + 150, 26, 40, C.blue, { font: HAND, bold: true });
  DEPTS.forEach((d, i) => {
    const r = rowRect(i);
    const target = S.crisis && d.id === 'immune';
    const res = S.resent[d.id];
    card(r.x, r.y, r.w, r.h, target ? C.pinkBg : C.white, target || res >= 60 ? C.red : '#C9C2B2', target ? 3 : res >= 60 ? 2.4 : 1.8);
    portrait(d.id, r.x + 2, r.y + 2, 76);
    txt(d.name, r.x + 82, r.y + 14, 22, C.ink, { font: HAND, bold: true });
    txt(res >= 85 ? '罷工中' : res >= 60 ? '抱怨中' : '上班中', r.x + 82, r.y + 46, 15, res >= 60 ? C.red : C.mute);
    for (let k = 0; k < S.tokens[d.id]; k++) {
      const [x, y] = dotPos(i, k);
      rbc(x, y, 9);
      if (d.id === 'brain' && k < 2) {
        noFill();
        stroke(C.blue);
        strokeWeight(2);
        ellipse(x, y, 24);
      }
    }
    if (target) {
      for (let k = S.tokens.immune; k < S.crisis.target; k++) emptyToken(...dotPos(i, k), 9);
    }
    const bx = r.x + 12;
    const bw = 104;
    const by = r.y + 112;
    noStroke();
    fill('#ECE8DD');
    rect(bx, by, bw, 10, 5);
    fill(res >= 85 ? C.darkRed : res >= 60 ? C.red : '#E3A23B');
    rect(bx, by, bw * res / 100, 10, 5);
    stroke(C.ink);
    strokeWeight(1.2);
    line(bx + bw * 0.6, by - 3, bx + bw * 0.6, by + 13);
    line(bx + bw * 0.85, by - 3, bx + bw * 0.85, by + 13);
    txt(`${res}`, r.x + r.w - 10, by + 5, 15, res >= 60 ? C.red : C.mute, { align: RIGHT, valign: CENTER });
  });
  txt('怨氣條：60 抱怨｜85 罷工', PANEL_X + 500, 372, 13, C.mute, { align: RIGHT });
  card(PANEL_X, 396, 500, 64, C.white, '#C9C2B2', 1.8);
  txt('待命池', PANEL_X + 16, 414, 21, C.ink, { font: HAND, bold: true });
  for (let k = 0; k < S.pool; k++) rbc(...poolDotPos(k), 10);
  if (S.pool === 0) txt('（空了）', PANEL_X + 110, 416, 18, C.red, { font: HAND });
  if (S.crisis) {
    card(PANEL_X, 476, 500, 164, C.pinkBg, C.red, 3);
    txt('調度危機（時間暫停）', PANEL_X + 20, 488, 24, C.darkRed, { font: HAND, bold: true });
    const got = S.tokens.immune - (S.crisis.target - S.crisis.need);
    txt(`免疫部還缺 ${S.crisis.target - S.tokens.immune} 枚，待命池只有 ${S.pool} 枚。把紅血球拖到免疫部；從別的部門挪人，該部門怨氣 +10。`,
      PANEL_X + 20, 524, 17, C.ink, { w: 360, leading: 25 });
    portrait('immune', PANEL_X + 404, 498, 84, 'warning');
    txt(`已補 ${got} / ${S.crisis.need}`, PANEL_X + 480, 492, 18, C.darkRed, { font: HAND, align: RIGHT });
  } else {
    push();
    translate(PANEL_X, 476);
    noStroke();
    fill('rgba(42,45,52,0.10)');
    rect(5, 6, 500, 164, 4);
    fill(C.sticky);
    rect(0, 0, 500, 164, 4);
    pop();
    const a = CHOICES.afternoon.find((c) => c.id === S.ch.afternoon).label;
    const e = CHOICES.evening.find((c) => c.id === S.ch.evening).label;
    const bed = CHOICES.bed.find((c) => c.id === S.ch.bed).label;
    txt('今日行程', PANEL_X + 20, 488, 22, C.red, { font: HAND, bold: true });
    const lines = [['上午', '上課'], ['下午', a], ['晚上', e], ['就寢', bed]];
    lines.forEach(([k, v], i) => {
      txt(k, PANEL_X + 20 + (i % 2) * 240, 528 + Math.floor(i / 2) * 44, 22, C.soft, { font: HAND });
      txt(v, PANEL_X + 80 + (i % 2) * 240, 528 + Math.floor(i / 2) * 44, 22, C.ink, { font: HAND, bold: true });
    });
  }
  noStroke();
  fill(C.ink);
  rect(PANEL_X, 652, 500, 48, 10);
  txt(S.marquee, PANEL_X + 18, 656, 16, C.paper, { w: 470, h: 44, leading: 21 });
}

function drawEventCard() {
  noStroke();
  fill('rgba(31,39,51,0.45)');
  rect(0, 0, W, H);
  push();
  translate(340, 150);
  rotate(-0.012);
  fill('rgba(0,0,0,0.18)');
  rect(8, 10, 600, 520, 6);
  fill(C.sticky);
  rect(0, 0, 600, 520, 6);
  pop();
  txt('事件卡｜19:00 宿舍', 380, 178, 22, C.red, { font: HAND });
  txt('室友在群組揪：「鹹酥雞，來不來？」', 380, 214, 32, C.ink, { font: HAND, bold: true });
  txt('沒有標準答案：社交也是一種資源。　手冊〈睡前進食與睡眠〉', 380, 268, 17, C.soft);
}

/* ---------------- night ---------------- */

SCENES.night = {
  enter() {
    const sleepH = 31 - S.ch.bed;
    const factors = S.sleepFactors.slice();
    const eff = factors.reduce((p, f) => p * f[1], 1);
    const effSleep = sleepH * eff;
    const debt0 = S.debt;
    const debt1 = effSleep >= 8 ? Math.max(0, debt0 - (effSleep - 8) * 0.5) : debt0 + (8 - effSleep);
    const studyH = (S.ch.afternoon === 'study' ? 4 : 0) + (S.ch.evening === 'study' ? 4 : 0) + (S.ch.bed - 23);
    const extra = S.tokens.brain - 2;
    const studyEff = (1 + 0.1 * extra) * sFactor(debt0);
    const progress = S.progress + studyH * studyEff;
    const sExam = sFactor(debt1);
    const score = Math.min(100, Math.round(60 * progress * sExam / 18));
    S.night = { sleepH, factors, eff, effSleep, debt0, debt1, studyH, studyEff, progress, sExam, score };
    S.debt = debt1;
    sfx(score >= 60 ? 'good' : 'bad');
    for (const d of DEPTS) S.resent[d.id] = Math.max(0, Math.round(S.resent[d.id] - 8 * effSleep));
    buttons.push(new Btn('快轉到第 7 天（展示用）→', 860, 620, 340, 62, () => enter('report'), { bg: C.blue, size: 22 }));
  },
  draw() {
    paper();
    const n = S.night;
    txt('第 4 天晚上｜睡眠結算', 96, 44, 22, C.red, { font: HAND });
    txt(n.debt1 > n.debt0 ? '睡眠債又變多了' : '今晚有好好還債', 96, 74, 40, C.blue, { font: HAND, bold: true });
    card(96, 150, 560, 440, C.white);
    const rows = [
      ['睡了多久', `${CHOICES.bed.find((c) => c.id === S.ch.bed).label} 睡到 07:00，共 ${n.sleepH} 小時`],
      ['睡眠效率', n.factors.length ? n.factors.map((f) => `${f[0]} ×${f[1]}`).join('、') : '沒有扣分（×1）'],
      ['有效睡眠', `${n.effSleep.toFixed(1)} 小時`],
      ['睡眠債', `${n.debt0} → ${n.debt1.toFixed(1)} 小時`],
      ['今天讀書', `${n.studyH} 小時，效率 ×${n.studyEff.toFixed(2)}`],
      ['學業進度', `${S.progress} → ${n.progress.toFixed(1)} 點`],
    ];
    rows.forEach(([k, v], i) => {
      txt(k, 124, 178 + i * 66, 22, C.soft, { font: HAND });
      txt(v, 260, 178 + i * 66, 22, C.ink, { font: HAND, bold: true, w: 370 });
    });
    push();
    translate(720, 150);
    rotate(0.015);
    noStroke();
    fill('rgba(0,0,0,0.12)');
    rect(6, 8, 460, 300, 4);
    fill(C.sticky);
    rect(0, 0, 460, 300, 4);
    pop();
    txt('第 5 天｜期中考', 750, 172, 24, C.red, { font: HAND, bold: true });
    txt(`${n.score}`, 750, 206, 96, n.score >= 60 ? C.blue : C.red, { font: HAND, bold: true });
    txt('分', 750 + (n.score >= 100 ? 168 : 116), 260, 30, C.ink, { font: HAND });
    txt(`考試分數 = 學業進度 × 考試當天睡眠係數（${n.sExam.toFixed(2)}）`, 750, 330, 18, C.soft, { w: 420 });
    txt('同樣的讀書量，睡得越少，打折越多。', 750, 384, 18, C.soft, { w: 420 });
    drawXiaochen(700, 440, 0.4, n.score >= 60 ? XC_FACE_HAPPY : XC_FACE_SAD);
    buttons.forEach((b) => b.draw());
  },
  skip() { enter('report'); },
};

/* ---------------- report ---------------- */

function reportLines() {
  const bed = CHOICES.bed.find((c) => c.id === S.ch.bed).label;
  const lines = [];
  lines.push(S.ch.bed > 23
    ? `第 4 天，小晨為了期中考熬到 ${bed}，大腦部門加班到深夜；`
    : `第 4 天，小晨雖然 23:00 就寢，睡眠債仍有 ${S.debt.toFixed(1)} 小時；`);
  const c = S.flags.crisis;
  lines.push(c === 'ignore' ? '下午室友狂咳時，免疫保全部的人手缺口始終沒有補上；'
    : c === 'brain' ? '營運長從大腦挪人支援免疫部，期中考後又全數調回讀書；'
      : c === 'borrow' ? '營運長向夜班借調人手，當晚的修復工作只完成七成；'
        : '免疫部雖然補足人手，怨氣卻一路逼近罷工；');
  if (S.flags.snack) lines.push('當晚還加點了鹹酥雞，胃部被迫上夜班。');
  lines.push('第 7 天，室友的流感病毒長驅直入，免疫部罷工，小晨第二次被送進急診。');
  return lines;
}

SCENES.report = {
  enter() {
    buttons.push(new Btn('解鎖員工手冊 →', 940, 620, 260, 62, () => enter('handbook'), { bg: C.blue, size: 22 }));
  },
  draw() {
    paper();
    txt('失敗也是教材', 96, 44, 22, C.red, { font: HAND });
    txt('倒閉了？報告會告訴你為什麼', 96, 74, 40, C.blue, { font: HAND, bold: true });
    noStroke();
    fill(C.ink);
    rect(104, 158, 760, 470);
    fill(C.white);
    stroke(C.ink);
    strokeWeight(2);
    rect(96, 150, 760, 470);
    txt('人體股份有限公司　倒閉調查報告', 476, 178, 30, C.ink, { font: HAND, bold: true, align: CENTER });
    stroke(C.ink);
    strokeWeight(2);
    line(130, 226, 822, 226);
    txt('事故經過', 130, 246, 22, C.ink, { font: HAND, bold: true });
    txt(reportLines().join(''), 130, 280, 22, C.ink, { font: HAND, w: 560, leading: 36 });
    txt('結果：公司宣告倒閉。', 130, 520, 22, C.ink, { font: HAND, bold: true });
    txt('調查委員會建議：閱讀員工手冊〈睡眠與免疫力〉。', 130, 560, 22, C.ink, { font: HAND });
    const t = Math.min(1, (millis() - S.enteredAt - 600) / 300);
    if (t > 0) {
      if (!S.flags.stamped) { S.flags.stamped = true; sfx('stamp'); }
      push();
      translate(760, 520);
      rotate(-0.26);
      scale(1 + (1 - t) * 1.2);
      noFill();
      stroke(`rgba(200,55,45,${t})`);
      strokeWeight(6);
      ellipse(0, 0, 150);
      txt('倒閉', 0, 2, 44, `rgba(200,55,45,${t})`, { font: HAND, bold: true, align: CENTER, valign: CENTER });
      pop();
    }
    txt('報告由因果紀錄自動追溯：每個狀態都記得是哪件事造成的。本展示的第 5 至 7 天以快轉帶過。', 900, 170, 18, C.soft, { w: 320, leading: 28 });
    drawXiaochen(890, 330, 0.44, XC_FACE_SAD);
    portrait('immune', 1050, 360, 170, 'quit');
    txt('免疫保全部：罷工中', 1135, 540, 18, C.red, { font: HAND, align: CENTER });
    buttons.forEach((b) => b.draw());
  },
  skip() { enter('handbook'); },
};

/* ---------------- handbook ---------------- */

SCENES.handbook = {
  enter() {
    sfx('unlock');
    buttons.push(new Btn('再玩一次', 860, 620, 170, 62, () => { newGame(); enter('morning'); }, { bg: C.blue, size: 22 }));
    buttons.push(new Btn('回標題', 1046, 620, 150, 62, () => newGame(), { size: 22 }));
  },
  draw() {
    paper();
    txt('跨局進度：解鎖的手冊頁永久保留', 96, 44, 22, C.red, { font: HAND });
    txt('員工手冊〈睡眠與免疫力〉', 96, 74, 40, C.blue, { font: HAND, bold: true });
    card(96, 150, 700, 340, C.white);
    const paras = [
      '睡眠不足時，身體比較容易被感冒病毒打倒。研究觀察到，每晚只睡 5 至 6 小時的人，比睡 7 小時以上的人更容易感冒。',
      '長期壓力也會壓抑免疫功能。考前的「最後衝刺」如果是靠熬夜換來的，可能正好在考試那幾天生病。',
      '遊戲裡的設定：睡眠債達 3 小時以上時，感冒機率 ×1.4。這是比研究結果保守的簡化數字。',
      '本頁為一般衛教，不是醫療建議；身體不適請就醫。',
    ];
    let y = 178;
    paras.forEach((p, i) => {
      txt(p, 128, y, i === 3 ? 18 : 22, i === 3 ? C.mute : C.ink, { font: i === 3 ? SANS : HAND, w: 636, leading: i === 3 ? 28 : 36 });
      textSize(i === 3 ? 18 : 22);
      textFont(i === 3 ? SANS : HAND);
      y += Math.ceil(textWidth(p) / 620) * (i === 3 ? 28 : 36) + 24;
    });
    push();
    translate(850, 160);
    rotate(0.03);
    noStroke();
    fill(C.sticky);
    rect(0, 0, 340, 150, 4);
    pop();
    txt('下一局解鎖新選項', 874, 180, 22, C.red, { font: HAND, bold: true });
    txt('日程卡「20 分鐘午睡」、睡眠債儀表', 874, 220, 20, C.ink, { font: HAND, w: 300 });
    drawXiaochen(930, 330, 0.48, XC_FACE_HAPPY);
    buttons.forEach((b) => b.draw());
  },
  skip() { newGame(); },
};
