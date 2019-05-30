import { Option } from '@ephox/katamari';

/**
 * Creates a look function that searches the current element and parent elements until
 * the predicate returns true
 *
 * f: item -> boolean
 */
var predicate = function (f) {
  return function (universe, item) {
    return f(item) ?
        Option.some(item) :
        universe.up().predicate(item, f);
  };
};

/**
 * Creates a look function that searches the current element and parent elements until
 * the selector is matched
 *
 * sel: selector
 */
var selector = function (sel) {
  return function (universe, item) {
    return universe.is(item, sel) ?
        Option.some(item) :
        universe.up().selector(item, sel);
  };
};

export default <any> {
  predicate: predicate,
  selector: selector
};