import { Universe } from '@ephox/boss';
import { Arr, Fun, Option } from '@ephox/katamari';

export type Looker<E, D> = (universe: Universe<E, D>, elem: E) => Option<E>;

const all = function <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[], f: (universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]) => Option<E>) {
  const head = elements[0];
  const tail = elements.slice(1);
  return f(universe, look, head, tail);
};

/**
 * Check if look returns the same element for all elements, and return it if it exists.
 */
const oneAll = function <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]) {
  return elements.length > 0 ?
    all(universe, look, elements, unsafeOne) :
    Option.none<E>();
};

const unsafeOne = function <E, D>(universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]) {
  const start = look(universe, head);
  return Arr.foldr(tail, function (b, a) {
    const current = look(universe, a);
    return commonElement(universe, b, current);
  }, start);
};

const commonElement = function <E, D>(universe: Universe<E, D>, start: Option<E>, end: Option<E>): Option<E> {
  return start.bind(function (s) {
    return end.filter(Fun.curry(universe.eq, s));
  });
};

export { oneAll };
