import LazyValue from './LazyValue';
import AsyncValues from '../async/AsyncValues';

/** par :: [LazyValue a] -> LazyValue [a] */
var par = function (lazyValues) {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};

export default <any> {
  par: par
};