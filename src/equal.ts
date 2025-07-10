function ObjectIs(x: any, y: any): boolean {
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
}

/** 是否是 plain object */
export function isPOJO(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== 'object' || obj === null) return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === Object.prototype || proto === null;
}

/**
 * 对两个对象进行简单的结构化比较
 *
 * ```javascript
 * isShallowEqual({ a: 1 }, { a: 1 }) === true
 * ```
 */
export function isShallowEqual(a: any, b: any): boolean {
  if ([a, b].every(isPOJO) || [a, b].every(Array.isArray)) {
    if (ObjectIs(a, b)) return true;
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (const k in a) if (!ObjectIs(a[k], b[k])) return false;
    return true;
  }

  return ObjectIs(a, b);
}
