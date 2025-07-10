export enum CountdownState {
  READY,
  RUNNING,
  PAUSED,
  ENDED,
}

export interface CountdownOptions {
  /** 总时长，毫秒值 */
  duration?: number;
  /** 步进值，两次倒数间隔，毫秒值 */
  step?: number;
  /** 从第几毫秒开始 */
  start?: number;
  /** 倒计时结束时回调 */
  onEnd?: () => void;
  /** 倒计时更新回调 */
  onProgress?: (data: { rest: number; count: number }) => void;
  /** 倒计时暂停时回调 */
  onPause?: () => void;
  /** 倒计时恢复时回调 */
  onResume?: () => void;
}

/**
 * 倒计时
 * 优化点：
 * - 用 performance.now 逼近两次 timer 真实流逝的时间差
 * - 用 setTimeout 替换 setInterval，防止回调函数的过量堆积
 */
export class Countdown {
  private timer = (0 as unknown) as ReturnType<typeof setTimeout>;
  /** 倒计时计数值，正整数 */
  private count = 0;
  /** 步进值，两次倒数间隔，毫秒值 */
  private step = 1000;
  /** 开始时间戳 */
  private startTime = performance.now();
  /** 开始时间和目标时间的时间差值 */
  private rest = 0;
  /** 总时长，毫秒 */
  private duration = 0;
  /** 暂停标识符 */
  private state = CountdownState.READY;

  /** 倒计时结束时回调 */
  onEnd?: () => void;
  /** 倒计时更新回调 */
  onProgress?: (data: { rest: number; count: number }) => void;
  /** 倒计时暂停时回调 */
  onPause?: () => void;
  /** 倒计时恢复时回调 */
  onResume?: () => void;

  private getOffset = () => performance.now() - (this.startTime + this.count * this.step);

  private callOnProgress = () => {
    if (typeof this.onProgress === 'function') {
      this.onProgress({
        rest: this.rest,
        count: this.count,
      });
    }
  };

  private countdown = () => {
    this.count++;
    const offset = this.getOffset();
    let nextTime = this.step - offset;
    if (nextTime <= 0) {
      nextTime = 0;
    }
    this.rest -= this.step;
    if (this.rest <= 0) {
      this.rest = 0;
      clearTimeout(this.timer);
      this.state = CountdownState.ENDED;
      this.callOnProgress();
      if (typeof this.onEnd === 'function') {
        this.onEnd();
      }
      return;
    }
    this.timer = setTimeout(this.countdown, nextTime);
    this.callOnProgress();
  };

  /** 查看状态 */
  getState = () => this.state;

  /** 开始倒计时 */
  start = (options: CountdownOptions) => {
    this.clear();
    this.reset(options);

    if (!this.duration || this.duration < 0) {
      return;
    }
    this.startTime = performance.now();
    this.state = CountdownState.RUNNING;
    // 立即执行一次
    this.timer = setTimeout(this.countdown, this.step);
    this.callOnProgress();
  };

  /** 暂停倒计时 */
  pause = () => {
    if (this.state !== CountdownState.RUNNING) return;

    this.state = CountdownState.PAUSED;
    clearTimeout(this.timer);
    const offset = this.getOffset();
    this.rest -= offset;
    this.callOnProgress();

    if (typeof this.onPause === 'function') {
      this.onPause();
    }
  };

  /** 恢复倒计时 */
  resume = () => {
    if (this.state !== CountdownState.PAUSED) return;

    const resumeOffset = this.rest - (this.duration - (this.count + 1) * this.step);
    this.startTime = performance.now() - (this.count + 1) * this.step + resumeOffset;
    this.rest = this.duration - this.count * this.step;
    this.timer = setTimeout(this.countdown, resumeOffset);
    this.state = CountdownState.RUNNING;

    if (typeof this.onResume === 'function') {
      this.onResume();
    }
  };

  /** 清除倒计时 */
  clear = () => {
    clearTimeout(this.timer);
    this.count = 0;
    this.rest = 0;
  };

  /** 重设倒计时参数 */
  reset = (options: CountdownOptions) => {
    const { duration, step, start, onProgress, onEnd, onPause, onResume } = options;
    duration && (this.duration = duration);
    step && (this.step = step);
    typeof onEnd === 'function' && (this.onEnd = onEnd);
    typeof onProgress === 'function' && (this.onProgress = onProgress);
    typeof onPause === 'function' && (this.onPause = onPause);
    typeof onResume === 'function' && (this.onResume = onResume);

    if (start) {
      this.count = Math.floor(this.rest / 1000) || 0;
    }
    this.rest = this.duration - (start ?? 0) || 0;
  };
}
