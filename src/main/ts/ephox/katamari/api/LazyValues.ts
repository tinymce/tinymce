import { LazyValue } from './LazyValue';
import AsyncValues from '../async/AsyncValues';

/** par :: [LazyValue a] -> LazyValue [a] */
var par = function <T> (lazyValues: LazyValue<T>[]) {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};

export default {
  par: par
};