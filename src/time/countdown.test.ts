import { Countdown } from '.';

test('countdown: onProgress', async () => {
  const countdown = new Countdown();
  const onProgress = jest.fn();
  jest.useFakeTimers();

  countdown.start({
    duration: 9000,
    onProgress: () => onProgress(),
  });

  jest.runAllTimers();
  expect(onProgress).toBeCalledTimes(10);
});

test('countdown: onEnd', async () => {
  const countdown = new Countdown();
  const onEnd = jest.fn();
  jest.useFakeTimers();

  countdown.start({
    duration: 1000,
    onEnd: () => onEnd(),
  });

  jest.runAllTimers();
  expect(onEnd).toBeCalled();
});

test('countdown: onPause', async () => {
  const countdown = new Countdown();
  let result;
  const onPause = jest.fn();
  jest.useFakeTimers();

  countdown.start({
    duration: 5000,
    onProgress: (data) => (result = data),
    onPause: () => onPause(),
  });

  setTimeout(countdown.pause, 1500);

  jest.runAllTimers();
  expect(onPause).toBeCalled();
  expect(JSON.stringify(result)).toBe(JSON.stringify({ rest: 3500, count: 1 }));
});

test('countdown: onResume', async () => {
  const countdown = new Countdown();
  const onResume = jest.fn();
  const onEnd = jest.fn();
  jest.useFakeTimers();

  countdown.start({
    duration: 5000,
    onResume: () => onResume(),
    onEnd: () => onEnd(),
  });

  setTimeout(countdown.pause, 1500);
  setTimeout(countdown.resume, 2500);
  setTimeout(() => expect(onEnd).toBeCalled(), 6001);

  jest.runAllTimers();
  expect(onResume).toBeCalled();
});
