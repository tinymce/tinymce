import { Universe } from '@ephox/boss';
import { Arr, Fun, Option } from '@ephox/katamari';
import { Direction, Successor, Transition, Traverse } from '../api/data/Types';

const traverse = <E>(item: E, mode: Transition): Traverse<E> => ({
  item: Fun.constant(item),
  mode: Fun.constant(mode)
});

const backtrack: Transition = function (universe, item, _direction, transition = sidestep) {
  return universe.property().parent(item).map(function (p) {
    return traverse(p, transition);
  });
};

const sidestep: Transition = function (universe, item, direction, transition = advance) {
  return direction.sibling(universe, item).map(function (p) {
    return traverse(p, transition);
  });
};

const advance: Transition = function (universe, item, direction, transition = advance) {
  const children = universe.property().children(item);
  const result = direction.first(children);
  return result.map(function (r) {
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
  { current: backtrack, next: sidestep, fallback: Option.none() },
  { current: sidestep, next: advance, fallback: Option.some(backtrack) },
  { current: advance, next: advance, fallback: Option.some(sidestep) }
];

const go = function <E, D> (universe: Universe<E, D>, item: E, mode: Transition, direction: Direction, rules: Successor[] = successors): Option<Traverse<E>> {
  // INVESTIGATE: Find a way which doesn't require an array search first to identify the current mode.
  const ruleOpt = Arr.find(rules, function (succ) {
    return succ.current === mode;
  });

  return ruleOpt.bind(function (rule) {
    // Attempt the current mode. If not, use the fallback and try again.
    return rule.current(universe, item, direction, rule.next).orThunk(function () {
      return rule.fallback.bind(function (fb) {
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
