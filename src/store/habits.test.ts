import { buildMonthCells, calcStreak, nextScaleValue, seedHabits } from './habits';

test('month cells cover days in month', () => {
  expect(buildMonthCells(2026, 9).length).toBe(30); // 2026-09 共30天
});

test('streak counts trailing checked days', () => {
  expect(
    calcStreak({ '2026-09-05': true, '2026-09-06': true, '2026-09-07': true }, '2026-09-07'),
  ).toBe(3);
});

test('seed has 10 habits in reference order with correct kinds', () => {
  const seeds = seedHabits();
  expect(seeds.length).toBe(10);
  const kinds = seeds.map((s) => s.kind);
  expect(kinds).toEqual([
    'number',
    'check',
    'check',
    'check',
    'number',
    'check',
    'check',
    'check',
    'number',
    'scale',
  ]);
  expect(seeds.map((s) => s.name)).toEqual([
    '体重',
    '锻炼',
    '拉伸',
    '肌酸',
    '蛋白',
    '剪辑',
    '阅读',
    '咖啡',
    '睡眠',
    '心情',
  ]);
  expect(seeds[0].unit).toBe('kg');
  expect(seeds[4].unit).toBe('g');
  expect(seeds[8].unit).toBe('h');
  expect(seeds[9].scaleMax).toBe(5);
});

test('nextScaleValue cycles 0..max then clears', () => {
  expect(nextScaleValue(undefined, 5)).toBe(1);
  expect(nextScaleValue(1, 5)).toBe(2);
  expect(nextScaleValue(5, 5)).toBe(undefined);
  expect(nextScaleValue(0, 5)).toBe(1);
});
