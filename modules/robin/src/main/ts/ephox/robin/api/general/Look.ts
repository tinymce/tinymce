import { Universe } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import * as Look from '../../look/Look';

const selector = function <E, D> (_universe: Universe<E, D>, sel: string) {
  return Look.selector(sel);
};

const predicate = function <E, D> (_universe: Universe<E, D>, pred: (e: E) => boolean) {
  return Look.predicate(pred);
};

const exact = function <E, D> (universe: Universe<E, D>, item: E) {
  const itemMatch = Fun.curry(universe.eq, item);

  return Look.predicate(itemMatch);
};

export {
  selector,
  predicate,
  exact
};
