import { isPOJO, isShallowEqual } from './equal';

interface IobjConstructor {
  name: string;
}

const objConstructor = function (this: IobjConstructor, name: string) {
  this.name = name;
};
const nonePlainObj = new (objConstructor as any)('hello');

test('equal: isPOJO', () => {
  expect(isPOJO(nonePlainObj)).toBeFalsy();
  expect(isPOJO({})).toBeTruthy();
});

test('equal: isShallowEqual', () => {
  expect(isShallowEqual({ a: 1 }, { a: 1 })).toBeTruthy();
});
