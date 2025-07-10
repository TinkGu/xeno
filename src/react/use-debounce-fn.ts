/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useDebounceFn/index.ts */
import { useMemo, useEffect, useRef } from 'react';
import { debounce, DebounceOptions } from '../event/lodash-funcs';

/**
 * 防抖的 useCallback 版本，详细文档可查阅 [ahooks](https://ahooks.js.org/zh-CN/hooks/use-debounce-fn)
 * @param fn 函数
 * @param wait 延迟时间，单位毫秒，默认 1000
 * @param options debounce 选项
 *
 * @example
 *
 * ```typescript
import React, { useState } from 'react';
import { useDebounceFn } from '@tinks/xeno/react';
export default () => {
  const [value, setValue] = useState(0);
  const onClick = useDebounceFn(() => {
    setValue(value + 1);
  }, 500);

  return (
    <button type="button" onClick={onClick}>
      Click fast!
    </button>
  );
};
 * ```
 * 如果你需要取消 debounce，可直接使用 `const fn = useDebounceFn(); fn.cancel()`
 */
export function useDebounceFn<T extends AnyFunction>(fn: T, wait = 1000, options?: DebounceOptions) {
  if (process.env.NODE_ENV === 'development') {
    typeof fn !== 'function' && console.error('[useDebounceFn] fn should be a function');
  }

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  // 清除防抖
  useEffect(
    () => () => {
      debounced.cancel();
    },
    [],
  );

  return debounced;
}

/** 防抖的 useCallback 版本，使用 immediate 风格 */
export function useDebounceImmediateFn<T extends AnyFunction>(fn: T, wait?: number, immediate = true) {
  return useDebounceFn(fn, wait, immediate ? { leading: true, trailing: false } : { leading: false, trailing: true });
}
