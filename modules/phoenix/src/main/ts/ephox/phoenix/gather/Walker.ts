import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

import { Direction, Successor, Transition, Traverse } from '../api/data/Types';

const traverse = <E>(item: E, mode: Transition): Traverse<E> => ({
  item,
  mode
});

const backtrack: Transition = (universe, item, _direction, transition = sidestep) => {
  return universe.property().parent(item).map((p) => {
    return traverse(p, transition);
  });
};

const sidestep: Transition = (universe, item, direction, transition = advance) => {
  return direction.sibling(universe, item).map((p) => {
    return traverse(p, transition);
  });
};

const advance: Transition = (universe, item, direction, transition = advance) => {
  const children = universe.property().children(item);
  const result = direction.first(children);
  return result.map((r) => {
    return traverse(r, transition);
  });
};

/*
 * Rule breakdown:
 *
 * current: the traversal that we are applying.
 * next: the next traversal to apply if the current traversal succeeds (e.g. advance after sidestepping)
 * fallback: the traversal to fallback to when the current traversal does not find a node
 */
const successors: Successor[] = [
  { current: backtrack, next: sidestep, fallback: Optional.none() },
  { current: sidestep, next: advance, fallback: Optional.some(backtrack) },
  { current: advance, next: advance, fallback: Optional.some(sidestep) }
];

const go = <E, D>(universe: Universe<E, D>, item: E, mode: Transition, direction: Direction, rules: Successor[] = successors): Optional<Traverse<E>> => {
  // INVESTIGATE: Find a way which doesn't require an array search first to identify the current mode.
  const ruleOpt = Arr.find(rules, (succ) => {
    return succ.current === mode;
  });

  return ruleOpt.bind((rule) => {
    // Attempt the current mode. If not, use the fallback and try again.
    return rule.current(universe, item, direction, rule.next).orThunk(() => {
      return rule.fallback.bind((fb) => {
        return go(universe, item, fb, direction);
      });
    });
  });
};

export {
  backtrack,
  sidestep,
  advance,
  go
};
