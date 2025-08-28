import { Universe } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

/**
 * Creates a look function that searches the current element and parent elements until
 * the predicate returns true
 *
 * f: item -> boolean
 */
const predicate = <E>(f: (e: E) => boolean) => {
  return <D>(universe: Universe<E, D>, item: E): Optional<E> => {
    return f(item) ?
      Optional.some(item) :
      universe.up().predicate(item, f);
  };
};

/**
 * Creates a look function that searches the current element and parent elements until
 * the selector is matched
 *
 * sel: selector
 */
const selector = (sel: string) => {
  return <E, D>(universe: Universe<E, D>, item: E): Optional<E> => {
    return universe.is(item, sel) ?
      Optional.some(item) :
      universe.up().selector(item, sel);
  };
};

export {
  predicate,
  selector
};
