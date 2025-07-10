/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useDebounceEffect/index.ts */
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { DebounceOptions } from '../event/lodash-funcs';
import { useDebounceFn } from './use-debounce-fn';
import { useUpdateEffect } from './use-update-effect';

/**
 * 让 useEffect 回调防抖执行，详细文档可查阅 [ahooks](https://ahooks.js.org/zh-CN/hooks/use-debounce-effect)
 * @param effect useEffect 回调
 * @param deps useEffect 的依赖列表
 * @param options debounce 选项
 *
 * @example
 *
 * ```typescript
import React, { useState } from 'react';
import { useDebounceEffect } from '@tink/xeno/react';

export default () => {
  const [value, setValue] = useState(0);

  useDebounceEffect(() => {
    console.log(value);
  }, [value], { wait: 2000 });

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
};
 * ```
 */
export function useDebounceEffect(effect: EffectCallback, deps?: DependencyList, options?: DebounceOptions) {
  const [flag, setFlag] = useState({});

  const debounced = useDebounceFn(
    () => {
      setFlag({});
    },
    options?.wait,
    options,
  );

  useEffect(() => {
    return debounced();
  }, deps);

  // 清除防抖
  useEffect(
    () => () => {
      debounced.cancel();
    },
    [],
  );

  useUpdateEffect(effect, [flag]);
}
