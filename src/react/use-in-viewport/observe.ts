import { nuid } from '../../string';

export type ObserverInstanceCallback = (isInViewport: boolean, entry?: IntersectionObserverEntry) => void;

export interface IntersectionObserverOptions extends IntersectionObserverInit {
  /** 仅触发一次（即首次展示时触发），之后便取消监听 */
  triggerOnce?: boolean;
}

type ObserverObject = {
  id: string;
  observer: IntersectionObserver;
  callbackMap: Map<Element, Array<ObserverInstanceCallback>>;
};

const observerMap = new Map<string, ObserverObject>();
const rootIdMap = new Map<IntersectionObserverInit['root'], string>();

/**
 * 根据 root 获取对应的 id
 * @param {Element | Document | null | undefined} root
 * @returns {string | undefined} id
 */
const getRootId = (root: IntersectionObserverInit['root']): string => {
  if (!root) return '0';
  let rootId = rootIdMap.get(root);
  if (!rootId) {
    rootId = nuid() + '';
    rootIdMap.set(root, rootId);
  }
  return rootId;
};

/**
 * 根据配置获取对应的 id，方便复用 observer
 * @param {IntersectionObserverOptions} options
 * @returns {string} id
 */
const optionsToId = (options?: IntersectionObserverOptions): string => {
  if (!options) {
    return '0';
  }
  const keys = ['root', 'rootMargin', 'threshold'];
  const id = Object.keys(options)
    .filter((k: keyof IntersectionObserverOptions) => k in keys && options[k] !== undefined)
    .sort()
    .map((k: keyof IntersectionObserverOptions) => {
      return `${k}_${k === 'root' ? getRootId(options.root) : options[k]}`;
    })
    .join(',');
  return id || '0';
};

const createObserver = (options: IntersectionObserverOptions = {}) => {
  const id = optionsToId(options);
  let instance = observerMap.get(id);
  if (!instance) {
    // 创建需要被观察对象的集合，每个对象都有一个列表来维护对应的回调
    const callbackMap = new Map<Element, Array<ObserverInstanceCallback>>();
    const thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const isInViewport = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
        for (const cb of callbackMap.get(entry.target) ?? []) {
          cb(isInViewport, entry);
        }
      }
    }, options);

    instance = {
      id,
      observer,
      callbackMap,
    };

    observerMap.set(id, instance);
  }

  return instance;
};

const unobserve = (element: Element, callback: ObserverInstanceCallback, ob: ObserverObject) => {
  const callbacks = ob.callbackMap.get(element) || [];
  // 从回调列表中删除此回调
  callbacks.splice(callbacks.indexOf(callback), 1);

  if (callbacks.length === 0) {
    // 如果某个被观察元素没有回调，就取消观察并删除此元素
    ob.callbackMap.delete(element);
    ob.observer.unobserve(element);
  }

  if (ob.callbackMap.size === 0) {
    // 如果某个 observer 没有需要观察的元素，就删除此 observer
    ob.observer.disconnect();
    observerMap.delete(ob.id);
  }
};

/**
 * @param {Element} element - 需要被观察的 DOM 元素
 * @param {ObserverInstanceCallback} callback - 回调函数
 * @param {IntersectionObserverOptions} options - observer 的配置
 * @returns {Function} - 注销函数
 */
export const observe = (element: Element, callback: ObserverInstanceCallback, options?: IntersectionObserverOptions) => {
  if (!hasIntersectionObserver()) {
    return () => void 0;
  }
  const ob = createObserver(options);
  if (!ob) return () => void 0;

  let cb = callback;
  const callbacks = ob.callbackMap.get(element) || [];
  if (!ob.callbackMap.has(element)) {
    ob.callbackMap.set(element, callbacks);
  }
  if (options?.triggerOnce) {
    cb = (isInViewport, entry) => {
      callback?.(isInViewport, entry);
      unobserve(element, cb, ob);
    };
  }
  callbacks.push(cb);
  ob.observer.observe(element);
  return () => unobserve(element, cb, ob);
};

/** 兼容判断 */
export function hasIntersectionObserver() {
  try {
    return 'IntersectionObserver' in window && 'IntersectionObserverEntry' in window;
  } catch (err) {
    return false;
  }
}
