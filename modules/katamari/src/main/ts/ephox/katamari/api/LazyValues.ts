import { LazyValue } from './LazyValue';
import * as AsyncValues from '../async/AsyncValues';
import { clearTimeout, setTimeout } from '@ephox/dom-globals';

/** par :: [LazyValue a] -> LazyValue [a] */
export const par = function <T> (lazyValues: LazyValue<T>[]) {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};

export const withTimeout: <T>(baseFn: (completer: (value: T) => void) => void, ifTimeout: () => T, timeout: number) => LazyValue<T> = <T> (baseFn: (completer: (value: T) => void) => void, ifTimeout: () => T, timeout: number): LazyValue<T> =>
  LazyValue.nu((completer) => {
    const done = (r: T) => {
      clearTimeout(timeoutRef);
      completer(r);
    };
    const timeoutRef = setTimeout(() => {
      done(ifTimeout());
    }, timeout);
    baseFn(done);
  });
