import React, { useEffect, useState } from 'react';
import { useLatest } from '../use-latest';
import { hasIntersectionObserver, observe } from './observe';
import type { ObserverInstanceCallback } from './observe';

export interface UseInViewportOptions extends IntersectionObserverInit {
  /** 仅触发一次（即首次展示时触发），之后便取消监听 */
  triggerOnce?: boolean;
  /** 进入、离开视口时的回调 */
  onChange?: ObserverInstanceCallback;
  /** 跳过判断，直接返回 true */
  skip?: boolean;
  /** 返回的结果中是否需要包含 ratio（元素与视口的交叉率）信息，默认不返回，减少 re-render 开销 */
  withRatio?: boolean;
}

/**
 * 检测目标是否进入视窗或元素
 *
 * ```typescript
 * import React, { useRef } from 'react';
 * import { useInViewport } from '@tinks/xeno/react';
 *
 * export default () => {
 *   const [isInViewport, ratio] = useInViewport(divRef);
 *   const divRef = useRef<HTMLDivElement>(null);
 *
 *   return <div ref={divRef} style={{ width: 200, height: 100 }}></div>
 * };
 * ```
 *
 * @param targetRef 被观察元素的 ref
 * @param options 参数，详细点击[这里](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)
 * @returns [isInViewport, ratio] 元素是否进入视窗，以及交叉率
 */
export const useInViewport = (targetRef: React.RefObject<HTMLElement>, options?: UseInViewportOptions) => {
  const skip = options?.skip || !hasIntersectionObserver();
  const [isInViewport, setIsInViewport] = useState<boolean | undefined>(skip ? true : undefined);
  const [ratio, setRatio] = useState(0);
  const onChange = useLatest(options?.onChange);

  useEffect(() => {
    if (!targetRef.current) return;
    if (skip) return;

    return observe(
      targetRef.current,
      (isInViewport, entry) => {
        setIsInViewport(isInViewport);
        if (options?.withRatio) {
          setRatio(entry?.intersectionRatio || 0);
        }
        onChange.current?.(isInViewport, entry);
      },
      options,
    );
  }, [targetRef]);

  return [isInViewport, ratio];
};

export type { ObserverInstanceCallback };
