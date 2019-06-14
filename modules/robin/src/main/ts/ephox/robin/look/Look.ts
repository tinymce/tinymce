import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';

/**
 * Creates a look function that searches the current element and parent elements until
 * the predicate returns true
 *
 * f: item -> boolean
 */
const predicate = function <E> (f: (e: E) => boolean) {
  return function <D> (universe: Universe<E, D>, item: E) {
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
const selector = function (sel: string) {
  return function <E, D> (universe: Universe<E, D>, item: E) {
    return universe.is(item, sel) ?
      Option.some(item) :
      universe.up().selector(item, sel);
  };
};

export default {
  predicate,
  selector
};