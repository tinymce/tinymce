import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

export interface Group<E> {
  readonly parent: E;
  readonly children: E[];
}

interface Data<E> {
  readonly groups: Group<E>[];
  readonly current: E[];
  readonly parent: E | null;
}
type AccOrSkip = <E>(rest: Data<E>, parent: E, item: E) => Data<E>;

// Start a new list so push the current group into the groups list (if not empty) and reset current to have just item
const nextlist = <E>(rest: Data<E>, parent: E, item: E): Data<E> => {
  return {
    groups: rest.current.length > 0 && rest.parent !== null ? rest.groups.concat({ parent: rest.parent, children: rest.current }) : rest.groups,
    current: [ item ],
    parent
  };
};

// Accumulating item into current list; groups is unaffected.
const accumulate = <E>(rest: Data<E>, parent: E, item: E): Data<E> => {
  return {
    groups: rest.groups,
    current: rest.current.concat([ item ]),
    parent
  };
};

const inspect = <E, D>(universe: Universe<E, D>, rest: Data<E>, item: E) => {
  // Conditions:
  // 1. There is nothing in the current list ... start a current list with item (nextlist)
  // 2. The item is the right sibling of the last thing on the current list ... accumulate into current list. (accumulate)
  // 3. Otherwise ... close off current, and start a new current with item (nextlist)
  const nextSibling = Optional.from(rest.current[rest.current.length - 1]).bind(universe.query().nextSibling);
  return nextSibling.bind<AccOrSkip>((next) => {
    const same = universe.eq(next, item);
    return same ? Optional.some(accumulate) : Optional.none();
  }).getOr(nextlist);
};

const textnodes = <E, D>(universe: Universe<E, D>, items: E[]): Group<E>[] => {
  const init: Data<E> = { groups: [], current: [], parent: null };

  const result = Arr.foldl(items, (rest, item) => {
    return universe.property().parent(item).fold(() => {
      // Items without parents don't affect the result.
      return rest;
    }, (parent) => {
      const builder = inspect(universe, rest, item);
      return builder(rest, parent, item);
    });
  }, init);

  return result.current.length > 0 && result.parent !== null ? result.groups.concat({ parent: result.parent, children: result.current }) : result.groups;
};

export {
  textnodes
};
