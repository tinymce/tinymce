import { Universe } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import { Direction } from '../api/data/Types';

const left = function (): Direction {
  const sibling = function <E, D>(universe: Universe<E, D>, item: E) {
    return universe.query().prevSibling(item);
  };

  const first = function <E>(children: E[]): Option<E> {
    return children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
  };

  return {
    sibling,
    first,
  };
};

const right = function (): Direction {
  const sibling = function <E, D>(universe: Universe<E, D>, item: E) {
    return universe.query().nextSibling(item);
  };

  const first = function <E>(children: E[]): Option<E> {
    return children.length > 0 ? Option.some(children[0]) : Option.none();
  };

  return {
    sibling,
    first,
  };
};

export const Walkers = {
  left,
  right
};