/** code from ahooks, see https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useThrottleEffect/index.ts */
import { useEffect, useState } from 'react';
import type { DependencyList, EffectCallback } from 'react';
import type { ThrottleOptions } from '../event/lodash-funcs';
import { useThrottleFn } from './use-throttle-fn';
import { useUpdateEffect } from './use-update-effect';

/**
 * 让 useEffect 回调节流执行，详细文档可查阅 [ahooks](https://ahooks.js.org/zh-CN/hooks/use-throttle-effect)
 * @param effect useEffect 回调
 * @param deps useEffect 的依赖列表
 * @param options throttle 选项
 *
 * @example
 *
 * ```typescript
import React, { useState } from 'react';
import { useThrottleEffect } from '@tinks/xeno/react';

export default () => {
  const [value, setValue] = useState(0);

  useThrottleEffect(() => {
    console.log(value);
  }, [value], { wait: 2000 });

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
};
 * ```
 */
export function useThrottleEffect(effect: EffectCallback, deps?: DependencyList, options?: ThrottleOptions) {
  const [flag, setFlag] = useState({});

  const throttled = useThrottleFn(
    () => {
      setFlag({});
    },
    options?.wait,
    options,
  );

  useEffect(() => {
    return throttled();
  }, deps);

  // 清除
  useEffect(
    () => () => {
      throttled.cancel();
    },
    [],
  );

  useUpdateEffect(effect, [flag]);
}
