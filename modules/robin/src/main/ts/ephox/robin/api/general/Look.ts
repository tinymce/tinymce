import { Universe } from '@ephox/boss';
import { Fun, Optional } from '@ephox/katamari';

import * as Look from '../../look/Look';

const selector = <E, D>(_universe: Universe<E, D>, sel: string): (universe: Universe<E, D>, item: E) => Optional<E> => {
  return Look.selector(sel);
};

const predicate = <E, D>(_universe: Universe<E, D>, pred: (e: E) => boolean): (universe: Universe<E, D>, item: E) => Optional<E> => {
  return Look.predicate(pred);
};

const exact = <E, D>(universe: Universe<E, D>, item: E): (universe: Universe<E, D>, item: E) => Optional<E> => {
  const itemMatch = Fun.curry(universe.eq, item);

  return Look.predicate(itemMatch);
};

export {
  selector,
  predicate,
  exact
};
