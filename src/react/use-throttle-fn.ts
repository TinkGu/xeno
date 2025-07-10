/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useThrottleFn/index.ts */
import { useEffect, useMemo, useRef } from 'react';
import { throttle, ThrottleOptions } from '../event/lodash-funcs';

/**
 * 节流的 useCallback 版本，详细文档可查阅 [ahooks](https://ahooks.js.org/zh-CN/hooks/use-throttle-fn)
 * @param fn 函数
 * @param wait 延迟时间，单位毫秒，默认 1000
 * @param options throttle 选项
 *
 * @example
 *
 * ```typescript
import React, { useState } from 'react';
import { useThrottleFn } from '@tinks/xeno/react';
export default () => {
  const [value, setValue] = useState(0);
  const onClick = useThrottleFn(() => {
    setValue(value + 1);
  }, 500);

  return (
    <button type="button" onClick={onClick}>
      Click fast!
    </button>
  );
};
 * ```
 * 如果你需要取消 throttle，可直接使用 `const fn = useThrottleFn(); fn.cancel()`
 */
export function useThrottleFn<T extends AnyFunction>(fn: T, wait = 1000, options?: ThrottleOptions) {
  if (process.env.NODE_ENV === 'development') {
    typeof fn !== 'function' && console.error(`useThrottleFn expected parameter is a function, got ${typeof fn}`);
  }

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const throttled = useMemo(
    () =>
      throttle(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  // 清除
  useEffect(
    () => () => {
      throttled.cancel();
    },
    [],
  );

  return throttled;
}
