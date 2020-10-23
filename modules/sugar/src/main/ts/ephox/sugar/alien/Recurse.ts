import { Optional } from '@ephox/katamari';

/**
 * Applies f repeatedly until it completes (by returning Optional.none()).
 *
 * Normally would just use recursion, but JavaScript lacks tail call optimisation.
 *
 * This is what recursion looks like when manually unravelled :)
 */
const toArray = <T = any, U extends T = T> (target: T, f: (t: T) => Optional<U>): U[] => {
  const r: U[] = [];

  const recurse = (e: U) => {
    r.push(e);
    return f(e);
  };

  let cur = f(target);
  do {
    cur = cur.bind(recurse);
  } while (cur.isSome());

  return r;
};

export {
  toArray
};
