// Morning planning options. `brain` / `muscle` are tokens moved out of the free pool for the day.
export const CHOICES = {
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
  // id is the bedtime hour; past midnight counts on (25 = 01:00).
  bed: [
    { id: 23, label: '23:00', sub: '睡 8 小時' },
    { id: 25, label: '01:00', sub: '睡 6 小時' },
    { id: 27, label: '03:00', sub: '睡 4 小時' },
  ],
};

// Used when the presenter skips the planning screen.
export const DEFAULT_PLAN = { breakfast: 'skip', afternoon: 'study', evening: 'study', bed: 25 };

export function choice(key, id) {
  return CHOICES[key].find((c) => c.id === id);
}
