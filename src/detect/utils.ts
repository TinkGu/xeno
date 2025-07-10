import { lowerIncludes } from '../string';

const UNKNOWN = '?';

export function filterUnknown(x: any) {
  return x === UNKNOWN ? '' : x;
}

/** 传入一个字符串和一组规则，对字符串进行 includes 识别。匹配成功则返回对应的规则名，否则按原字符串返回 */
export function strMapper(str: string, map: any) {
  for (const i in map) {
    // check if current value is array
    if (typeof map[i] === 'object' && map[i].length > 0) {
      for (let j = 0; j < map[i].length; j++) {
        if (lowerIncludes(map[i][j], str)) {
          return i === UNKNOWN ? undefined : i;
        }
      }
    } else if (lowerIncludes(map[i], str)) {
      return i === UNKNOWN ? undefined : i;
    }
  }
  return str;
}
