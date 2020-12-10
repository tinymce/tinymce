import { Universe } from '@ephox/boss';
import { Arr, Fun, Optional } from '@ephox/katamari';

export type Looker<E, D> = (universe: Universe<E, D>, elem: E) => Optional<E>;

const all = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[], f: (universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]) => Optional<E>): Optional<E> => {
  const head = elements[0];
  const tail = elements.slice(1);
  return f(universe, look, head, tail);
};

/**
 * Check if look returns the same element for all elements, and return it if it exists.
 */
const oneAll = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]): Optional<E> => {
  return elements.length > 0 ?
    all(universe, look, elements, unsafeOne) :
    Optional.none<E>();
};

const unsafeOne = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]): Optional<E> => {
  const start = look(universe, head);
  return Arr.foldr(tail, (b, a) => {
    const current = look(universe, a);
    return commonElement(universe, b, current);
  }, start);
};

const commonElement = <E, D>(universe: Universe<E, D>, start: Optional<E>, end: Optional<E>): Optional<E> => {
  return start.bind((s) => {
    return end.filter(Fun.curry(universe.eq, s));
  });
};

export { oneAll };
