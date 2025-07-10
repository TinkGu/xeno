import { trim, nuid } from './string';

test('string: trim string', () => {
  expect(trim('test trim ')).toBe('test trim');
});

test('string: nuid', () => {
  expect(nuid()).toBe(1);
  expect(nuid()).toBe(2);
});
