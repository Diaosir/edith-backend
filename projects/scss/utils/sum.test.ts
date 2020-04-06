import sum from './sum';

describe('sum', () => {
  test('sum 1 + 2 = 3', function() {
    expect(sum(1,2)).toBe(3);
  })
  test('sum 2 + 2 = 4', function() {
    expect(sum(2,2)).toBe(3);
  })
}) 