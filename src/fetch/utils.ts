export function safeMerge(x: any, o: any) {
  if (x === undefined || x === null) {
    return o;
  }

  if (typeof x === 'object') {
    return Object.assign({}, x, o);
  }

  return x;
}
