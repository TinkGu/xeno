import { qsParse, qsParseTyped, qsEncode, qsMerge } from './url';

const uniHost = 'https://www.github.com';

test('url: qsParse', () => {
  expect(qsParse(`${uniHost}?a=1&b=2`)).toEqual({
    a: '1',
    b: '2',
  });
});

test('url: qsParseTyped', () => {
  expect(qsParseTyped({ a: 'number' }, `${uniHost}?a=1&b=as`)).toEqual({
    a: 1,
    b: 'as',
  });
});

test('url: qsEncode', () => {
  expect(qsEncode({ a: 'test', b: 1 })).toBe('a=test&b=1');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  expect(qsEncode()).toBe('');
  expect(qsEncode({})).toBe('');
  expect(qsEncode({ a: '', b: undefined, c: 0, e: null })).toBe('c=0');
});

test('url: qsMerge', () => {
  expect(qsMerge({ c: 'hehe' }, `${uniHost}`)).toBe('https://www.github.com?c=hehe');
});
