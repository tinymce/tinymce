import { Option } from '@ephox/katamari';

/**
 * Applies f repeatedly until it completes (by returning Option.none()).
 *
 * Normally would just use recursion, but JavaScript lacks tail call optimisation.
 *
 * This is what recursion looks like when manually unravelled :)
 */
const toArray = function  <T = any>(target: T, f: (T) => Option<T>) {
  const r: T[] = [];

  const recurse = function (e) {
    r.push(e);
    return f(e);
  };

  let cur = f(target);
  do {
    cur = cur.bind(recurse);
  } while (cur.isSome());

  return r;
};

export default {
  toArray
};