import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';

export type Traverse = {
  item: () => unknown
  mode: () => unknown
}
var traverse = Struct.immutable('item', 'mode');

var backtrack = function (universe, item, direction, _transition): Option<Traverse> {
  var transition = _transition !== undefined ? _transition : sidestep;
  return universe.property().parent(item).map(function (p) {
    return traverse(p, transition);
  });
};

var sidestep = function (universe, item, direction, _transition): Option<Traverse> {
  var transition = _transition !== undefined ? _transition : advance;
  return direction.sibling(universe, item).map(function (p) {
    return traverse(p, transition);
  });
};

var advance = function (universe, item, direction, _transition): Option<Traverse> {
  var transition = _transition !== undefined ? _transition : advance;
  var children = universe.property().children(item);
  var result = direction.first(children);
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
export type Successor = {
  current: (...any) => Option<Traverse>,
  next: (...any) => Option<Traverse>,
  fallback: Option<unknown>
}

var successors: Successor[] = [
  { current: backtrack, next: sidestep, fallback: Option.none() },
  { current: sidestep, next: advance, fallback: Option.some(backtrack) },
  { current: advance, next: advance, fallback: Option.some(sidestep) }
];

var go = function (universe, item, mode, direction, rules?: Successor[]) {
  var rules = rules !== undefined ? rules : successors;
  // INVESTIGATE: Find a way which doesn't require an array search first to identify the current mode.
  var ruleOpt = Arr.find(rules, function (succ) {
    return succ.current === mode;
  });

  return ruleOpt.bind(function (rule) {
    // Attempt the current mode. If not, use the fallback and try again.
    return rule.current(universe, item, direction, rule.next).orThunk(function () {
      return rule.fallback.bind(function (fb) {
        return go(universe, item, fb, direction)
      });
    });
  });
};

export default {
  backtrack,
  sidestep,
  advance,
  go,
};