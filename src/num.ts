/**
 * @module
 * @title 数字
 */
/**
 * 将数字约束到 [min, max] 的区间内
 *
 * ```javascript
 * range(0, 5, 10) // => 5
 * range(102, 0, 99) // => 99
 * ```
 */
export function range(x: any, min: number, max: number, _default?: number) {
  const xmin = Math.max(x, min);
  const result = Math.min(xmin, max);
  if (!result && result !== 0) {
    return _default ?? min;
  }
  return result;
}
