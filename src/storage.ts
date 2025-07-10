import { warning } from './internal/log';

enum StorageType {
  localStorage = 'localStorage',
  sessionStorage = 'sessionStorage',
}

/**
 * 设置 storage，有以下特点
 * - 自动 stringify
 * - 若设置 `undefined`、`null`、`''`，改为 removeItem
 * - 自动 try-catch
 */
const setStorage = (type: StorageType) => (key: string, val?: any) => {
  const storage = window[type];
  if (!storage) {
    warning(`[xeno]: no ${type} in window or not in browser`);
    return;
  }

  try {
    if (val !== undefined && val !== '' && val !== null) {
      storage.setItem(key, JSON.stringify(val));
    } else {
      storage.removeItem(key);
    }
  } catch (e) {
    // nothing
  }
};

/**
 * 获取 storage，有以下特点
 * - 自动 parse
 */
const getStorage = (type: StorageType) => (key: string) => {
  const storage = window[type];
  try {
    const val = storage.getItem(key);
    const ret = val && JSON.parse(val);
    return val ? ret : null;
  } catch (e) {
    return null;
  }
};

/*
 * 设置 localStorage
 */
export const setLocalStorage = setStorage(StorageType.localStorage);

/**
 * 获取 localStorage
 */
export const getLocalStorage = getStorage(StorageType.localStorage);

/*
 * 设置 sessionStorage
 */
export const setSessionStorage = setStorage(StorageType.sessionStorage);

/**
 * 获取 sessionStorage
 */
export const getSessionStorage = getStorage(StorageType.sessionStorage);
