import { buildMonthCells, calcStreak } from './habits';

test('month cells cover days in month', () => {
  expect(buildMonthCells(2026, 9).length).toBe(30); // 2026-09 共30天
});

test('streak counts trailing checked days', () => {
  expect(
    calcStreak({ '2026-09-05': true, '2026-09-06': true, '2026-09-07': true }, '2026-09-07'),
  ).toBe(3);
});
