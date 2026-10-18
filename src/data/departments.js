// Departments that can hold tokens. Coordinates are in body-map space (see scenes/day/layout.js):
// `center` is the organ, `label` the name tag, `bubble` the anchor of its speech bubble.
export const DEPTS = [
  { id: 'brain', name: '大腦', center: [300, 104], label: [146, 84], bubble: [352, 70] },
  { id: 'immune', name: '免疫', center: [300, 224], label: [92, 214], bubble: [330, 200] },
  { id: 'liver', name: '肝', center: [262, 318], label: [100, 300], bubble: [420, 350] },
  { id: 'stomach', name: '胃', center: [348, 330], label: [444, 300], bubble: [380, 310] },
  { id: 'gut', name: '腸道菌', center: [300, 410], label: [452, 380], bubble: [350, 392] },
  { id: 'muscle', name: '肌肉', center: [300, 530], label: [104, 520], bubble: [372, 500] },
];

export const deptById = Object.fromEntries(DEPTS.map((d) => [d.id, d]));

// Resentment thresholds (design doc): 60 complains, 85 goes on strike.
export const WARN_AT = 60;
export const QUIT_AT = 85;

// The brain always keeps this many tokens; they cannot be reassigned in a crisis.
export const BRAIN_RESERVED = 2;
