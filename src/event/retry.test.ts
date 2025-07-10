import { withRetry } from './retry';

jest.useFakeTimers();
describe('retry', () => {
  const getErrMsg = (util: number, count: number) => `${util}, ${count}`;

  /** 运行直到第 n 次才能成功 */
  function runFailedUtil(util: number) {
    let count = 0;
    const spy = jest.fn();
    return [
      function run() {
        spy();
        count++;
        if (count >= util) {
          return count;
        } else {
          throw new Error(getErrMsg(util, count));
        }
      },
      spy,
    ];
  }

  /** 根据传入的数组，遇到 1 返回成功值，遇到 0 报错 */
  function runInResult(results: (1 | 0)[], defaults = 1) {
    let count = 0;
    const spy = jest.fn();
    return [
      function run() {
        spy();
        count++;
        const res = results[count - 1] ?? defaults;
        const isOk = res === 1;
        if (isOk) {
          return count;
        } else {
          throw { count };
        }
      },
      spy,
    ];
  }

  const withCatch = (p: Promise<any>) =>
    p
      .catch(() => {
        /* **/
      })
      .then(() => 1);

  it('无需重试', async () => {
    const spy = jest.fn();
    const val = 99;
    const noop = () => {
      spy();
      return val;
    };
    const noopTask = withRetry(noop);
    const res = await noopTask();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(res).toBe(val);
  });

  it('重试一次', async () => {
    const [runner, spy] = runFailedUtil(2);
    const task = withRetry(runner, { retryTimes: 1 });
    await task();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('成功后应该立即结束', async () => {
    const times = Math.floor(Math.random() * 20);
    const [runner, spy] = runFailedUtil(times);
    const timesTask = withRetry(runner, { retryTimes: 100 });
    const res = await timesTask();
    expect(spy).toHaveBeenCalledTimes(times);
    expect(res).toBe(times);
  });

  it('重试达到上限后应该报错', async () => {
    const [runner, spy] = runFailedUtil(6);
    const errTask = withRetry(runner, { retryTimes: 2 });
    await expect(errTask()).rejects.toThrow(getErrMsg(6, 3));
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('task 调用后应各自计数', async () => {
    const [runner, spy] = runFailedUtil(6);
    const task = withRetry(runner, { retryTimes: 2 });
    await Promise.allSettled([task(), task()]);
    expect(spy).toHaveBeenCalledTimes(6);
  });

  it('达到超时前能顺利重试，直至消耗完次数', async () => {
    jest.useRealTimers();
    const [runner, spy] = runFailedUtil(20);
    const task = withRetry(runner, { retryTimes: 2, timeout: 200, retryInterval: 90 });
    await withCatch(task());
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('超时后报错退出，不再继续重试', async () => {
    jest.useRealTimers();
    const [runner, spy] = runFailedUtil(20);
    const task = withRetry(runner, { retryTimes: 9, timeout: 500, retryInterval: 90 });
    await withCatch(task());
    expect(spy).toHaveBeenCalledTimes(Math.floor(500 / 90) + 1);
  });

  it('设置 checkResolve，强制 reject', async () => {
    const [runner, spy] = runFailedUtil(0);
    const asRejectTask = withRetry(runner, {
      retryTimes: 2,
      checkResolve: (runnerTimes, { remainTimes, retryTimes }) => {
        expect(runnerTimes - 1).toBe(retryTimes - remainTimes);
        // 直到最后一次重试，才算成功
        if (remainTimes === 0) {
          return;
        } else {
          throw { message: 'for some reasons, this task result as reject' };
        }
      },
    });
    await asRejectTask();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('设置 checkResolve，强制 reject，且 resolve 最近一次成功结果', async () => {
    // 函数第二次运行才能成功
    const [runner, spy] = runInResult([0, 1, 0], 1);
    const asRejectTask = withRetry(runner, {
      retryTimes: 2,
      checkResolve: (runnerTimes, { remainTimes, retryTimes }) => {
        expect(runnerTimes - 1).toBe(retryTimes - remainTimes);
        // 始终认为失败
        throw { message: 'for some reasons, this task result as reject' };
      },
      resolveLastResult: true,
    });
    const res = await asRejectTask();
    expect(spy).toHaveBeenCalledTimes(3);
    expect(res).toBe(2);
  });
});
