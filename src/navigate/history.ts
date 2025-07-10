import { createBrowserHistory, History } from 'history';

let _history: History | null = null;

/** 初始化 history */
export function initBrowserHistory() {
  _history = createBrowserHistory();
}

/** 清除 history 实例 */
export function clearBrowserHistory() {
  _history = null;
}

/** 获取 history 实例 */
export function getHistory(): History {
  if (!_history) {
    initBrowserHistory();
  }
  return _history!;
}
