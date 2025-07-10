import { defaultRegMap, osNameMap } from './config';
import { filterUnknown, strMapper } from './utils';

/**
 * 解析 ua
 *
 * 主逻辑 code 来自 [ua-parser-js](https://github.com/faisalman/ua-parser-js/blob/a29213960c7a1b80fded50d82936002fd0ccb939/src/ua-parser.js#L104)，
 * 进行了一些平台、设备信息的裁剪，减少体积
 */
function rgxMapper<T = any>(ua: string, arrays: any[]) {
  const result = {} as any;
  let i = 0,
    j,
    k,
    p,
    q,
    matches,
    match;

  // loop through all regexes maps
  while (i < arrays.length && !matches) {
    const regex = arrays[i], // even sequence (0,2,4,..)
      props = arrays[i + 1]; // odd sequence (1,3,5,..)
    j = k = 0;

    // try matching uastring with regexes
    while (j < regex.length && !matches) {
      matches = regex[j++].exec(ua);

      // eslint-disable-next-line no-extra-boolean-cast
      if (!!matches) {
        for (p = 0; p < props.length; p++) {
          match = matches[++k];
          q = props[p];
          // check if given property is actually array
          if (typeof q === 'object' && q.length > 0) {
            if (q.length === 2) {
              if (typeof q[1] == 'function') {
                // assign modified match
                result[q[0]] = q[1].call(result, match);
              } else {
                // assign given value, ignore regex match
                result[q[0]] = q[1];
              }
            } else if (q.length === 3) {
              // check whether function or regex
              if (typeof q[1] === 'function' && !(q[1].exec && q[1].test)) {
                // call function (usually string mapper)
                result[q[0]] = match ? q[1].call(result, match, q[2]) : undefined;
              } else {
                // sanitize match using given regex
                result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
              }
            } else if (q.length === 4) {
              result[q[0]] = match ? q[3].call(result, match.replace(q[1], q[2])) : undefined;
            }
          } else {
            result[q] = match ? match : undefined;
          }
        }
      }
    }
    i += 2;
  }
  return result as T;
}

/** 获取系统名称和版本号 */
export function parseOs(ua: string) {
  const os = rgxMapper(ua, defaultRegMap.os);
  return {
    name: strMapper(filterUnknown(os?.name), osNameMap) || '',
    version: filterUnknown(os?.version) || '',
  };
}

/** 获取系统名称和版本号，目前只分析微信浏览器 */
export function parseBrowser(ua: string) {
  const browser = rgxMapper(ua, defaultRegMap.browser);
  return {
    name: filterUnknown(browser?.name) || '',
    version: filterUnknown(browser?.version) || '',
  };
}
