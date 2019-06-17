import { Universe } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import { Wrapter } from '../api/data/Types';

export const Wraps = function <E, D>(universe: Universe<E, D>, item: E): Wrapter<E> {
  const wrap = function (contents: E) {
    universe.insert().append(item, contents);
  };

  return {
    element: Fun.constant(item),
    wrap
  };
};