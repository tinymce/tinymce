import { LazyValue } from './LazyValue';
import * as AsyncValues from '../async/AsyncValues';
import { Option } from './Option';
import * as Fun from './Fun';
import { clearTimeout, setTimeout } from '@ephox/dom-globals';

/** par :: [LazyValue a] -> LazyValue [a] */
export const par = function <T> (lazyValues: LazyValue<T>[]) {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};

/**
 * Produces a LazyValue that may time out.
 * If it times out, it produces an Option.none.
 * If it completes before the timeout, it produces an Option.some.
 */
export const withTimeout = <T>(baseFn: (completer: (value: T) => void) => void, timeout: number): LazyValue<Option<T>> =>
  LazyValue.nu((completer) => {
    const done = (r: Option<T>) => {
      clearTimeout(timeoutRef);
      completer(r);
    };
    const timeoutRef = setTimeout(() => {
      done(Option.none());
    }, timeout);
    baseFn(Fun.compose(done, Option.some));
  });
