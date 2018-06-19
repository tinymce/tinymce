import { LazyValue } from './LazyValue';
import * as AsyncValues from '../async/AsyncValues';

/** par :: [LazyValue a] -> LazyValue [a] */
export const par = function <T> (lazyValues: LazyValue<T>[]) {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};