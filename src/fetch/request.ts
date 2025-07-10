import axios, { AxiosInstance, Method, ResponseType } from 'axios';
import { RetryOptions, withRetry } from '../event/retry';
import { warning } from '../internal/log';
import { safeMerge } from './utils';

/** 请求体 */
export interface RequestConfig<T> {
  url: string;
  headers?: Record<string, string>;
  data?: T;
  responseType?: ResponseType;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  withCredentials?: boolean;
  timeout?: number;
  code?: string | number;
  useRawData?: boolean;
  useRawResponse?: boolean;
  withTimestamp?: boolean;
  method?: Method;
  retry?: RetryOptions;
  axiosInstance?: AxiosInstance;
}

/** 请求返回结果 */
export type ReponseResult<U> = U & {
  _status: number;
};

/**
 * 通用接口请求
 *
 * **参数**
 * - `url`
 * - `headers`
 * - `method` http method
 * - `data` 请求时携带的 request data，根据 method 判断转为 query 还是 params
 * - `withCredentials` 请求时是否自动携带 cookie，默认 true
 * - `timeout` 单次超时时间，毫秒值，默认 10 秒
 * - `code` 当返回体的 res.data.code 值 === code 时才算请求成功，默认 '0'
 * - `useRawData` 请求成功时，除了返回 data 也返回 code、message、_status 等信息
 * - `useRawResponse` 请求成功时，不校验任何信息，直接返回整个 response
 * - `withTimestamp` 请求链接中是否带上一个随机时间戳，防止被缓存，主要解决某些 webview 自动缓存 get 请求的问题，[详见](https://alidocs.dingtalk.com/i/team/Y7kmb58PWN4MXLq2/docs/Y7kmbxB3xrN4zLq2?corpId=ding51f195092fd77474&iframeQuery=)
 * - `axiosInstance` 使用预先以 axios.create 生成的 axios 实例来进行请求
 * - `retry` 是否重试
 *   - `retry.retryTimes` 重试次数，默认 0，不重试
 *   - `retry.retryInterval` 两次重试间隔时间，毫秒值，默认 1000
 *   - `retry.timeout` 重试 n 次整体的超时时间，默认 10000
 *
 * 其它参数请参考 [axios 官方文档](https://www.axios-http.cn/docs)
 *
 * ---
 *
 * **如何添加拦截器**
 *
 * axios 支持在请求发出之前、请求错误、响应处理之前、响应错误这四个事件点添加拦截器。[文档](https://www.axios-http.cn/docs/interceptors)。
 *
 * 适用于以下场景
 * - 对请求添加统一参数
 * - 统一处理错误，如打点上报等
 * - 通过 axios.create 产生一个 axios 实例，并对其注册拦截器，规范同类型请求的行为
 *
 */
export function request<T, U>({
  url = '',
  headers = {},
  data: rawData = {} as U,
  responseType = 'json',
  onUploadProgress,
  onDownloadProgress,
  withCredentials = true,
  withTimestamp,
  timeout = 10000,
  code = '0',
  useRawData,
  useRawResponse,
  method,
  retry,
  axiosInstance,
}: RequestConfig<U>): Promise<ReponseResult<T>> {
  const innerRequest = () => {
    let data = rawData;
    if (withTimestamp) {
      data = (data as any)?.t ? data : safeMerge(data, { t: Date.now() });
    }

    const xhr = axiosInstance || axios;
    return xhr({
      url,
      method,
      headers,
      params: method === 'get' ? data : null,
      data,
      responseType,
      onUploadProgress,
      onDownloadProgress,
      timeout,
      withCredentials,
    })
      .then((res) => {
        if (useRawResponse) {
          return res;
        }
        const result = res.data;
        // 使得返回值中可以取到 status
        if (result && typeof result === 'object') {
          result._status = res.status;
        }
        if (res.status === 200) {
          if (useRawData) {
            return result;
          }
          if (result.code === code) {
            return result.data;
          }
          throw result;
        }
        throw result;
      })
      .catch((err) => {
        warning(`fetch: ${url} error, params: ${JSON.stringify(data)}`, JSON.stringify(err));
        throw err;
      });
  };

  return withRetry(innerRequest, {
    ...(retry || {}),
    retryTimes: Number(retry?.retryTimes) || 0,
    retryInterval: Number(retry?.retryInterval) || 1000,
    timeout: Number(retry?.timeout) || 10000,
  })();
}

const hyperRequest =
  (method: Method) =>
  <T = any, U = any>(configs: RequestConfig<U>) =>
    request<T, U>({ ...configs, method });

export const get = hyperRequest('get');
export const post = hyperRequest('post');
export const put = hyperRequest('put');
export const del = hyperRequest('delete');
