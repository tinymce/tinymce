import { Universe } from '@ephox/boss';
import { Arr, Option } from '@ephox/katamari';

interface Data<E> {
  groups: {
    parent: E;
    children: E[];
  }[];
  current: E[];
  parent: E | null;
}
type AccOrSkip = <E>(rest: Data<E>, parent: E, item: E) => Data<E>;

// Start a new list so push the current group into the groups list (if not empty) and reset current to have just item
const nextlist = function <E>(rest: Data<E>, parent: E, item: E): Data<E> {
  return {
    groups: rest.current.length > 0 && rest.parent !== null ? rest.groups.concat({ parent: rest.parent, children: rest.current }) : rest.groups,
    current: [item],
    parent
  };
};

// Accumulating item into current list; groups is unaffected.
const accumulate = function <E>(rest: Data<E>, parent: E, item: E): Data<E> {
  return {
    groups: rest.groups,
    current: rest.current.concat([item]),
    parent
  };
};

const inspect = function <E, D>(universe: Universe<E, D>, rest: Data<E>, item: E) {
  // Conditions:
  // 1. There is nothing in the current list ... start a current list with item (nextlist)
  // 2. The item is the right sibling of the last thing on the current list ... accumulate into current list. (accumulate)
  // 3. Otherwise ... close off current, and start a new current with item (nextlist)
  const nextSibling = Option.from(rest.current[rest.current.length - 1]).bind(universe.query().nextSibling);
  return nextSibling.bind<AccOrSkip>(function (next) {
    const same = universe.eq(next, item);
    return same ? Option.some(accumulate) : Option.none();
  }).getOr(nextlist);
};

const textnodes = function <E, D>(universe: Universe<E, D>, items: E[]) {
  const init: Data<E> = { groups: [], current: [], parent: null };

  const result = Arr.foldl(items, function (rest, item) {
    return universe.property().parent(item).fold(function () {
      // Items without parents don't affect the result.
      return rest;
    }, function (parent) {
      const builder = inspect(universe, rest, item);
      return builder(rest, parent, item);
    });
  }, init);

  return result.current.length > 0 && result.parent !== null ? result.groups.concat({ parent: result.parent, children: result.current }) : result.groups;
};

export {
  textnodes
};
