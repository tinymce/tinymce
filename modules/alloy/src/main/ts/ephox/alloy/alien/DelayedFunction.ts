export interface DelayedFunction<T extends (...args: any[]) => void> {
  readonly schedule: (...args: Parameters<T>) => void;
  readonly cancel: () => void;
}

export const DelayedFunction = <T extends (...args: any[]) => void>(fun: T, delay: number): DelayedFunction<T> => {
  let ref: number | null = null;

  const schedule = (...args: Parameters<T>): void => {
    ref = setTimeout(() => {
      fun.apply(null, args);
      ref = null;
    }, delay);
  };

  const cancel = (): void => {
    if (ref !== null) {
      clearTimeout(ref);
      ref = null;
    }
  };

  return {
    cancel,
    schedule
  };
};
