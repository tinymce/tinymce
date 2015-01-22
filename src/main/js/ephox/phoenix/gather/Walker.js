define(
  'ephox.phoenix.gather.Walker',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Arr, Option, Struct) {
    var traverse = Struct.immutable('item', 'mode');

    // Jump back to the parent, with sidestep the next action.
    var backtrack = function (universe, item, direction, _transition) {
      var transition = _transition !== undefined ? _transition : sidestep;
      return universe.property().parent(item).map(function (p) {
        return traverse(p, transition);
      });
    };

    // Jump to the sibling, with advance the next action
    var sidestep = function (universe, item, direction, _transition) {
      var transition = _transition !== undefined ? _transition : advance;
      return direction.sibling(universe, item).map(function (p) {
        return traverse(p, transition);
      });
    };

    // Jump to the child, with advance the next action
    var advance = function (universe, item, direction, _transition) {
      var transition = _transition !== undefined ? _transition : advance;
      var children = universe.property().children(item);
      var result = direction.first(children);
      return result.map(function (r) {
        return traverse(r, transition);
      });
    };

    var successors = [
      { current: backtrack, next: sidestep, fallback: Option.none() },
      { current: sidestep, next: advance, fallback: Option.some(backtrack) },
      { current: advance, next: advance, fallback: Option.some(sidestep) }
    ];

    // Rules:
    // - if we are advancing ... try to advance. If we have no children to advance to,
    //   then we try again with mode = sidestep
    // - if we are sidestepping ... try to sidestep, but jump back to the parent if we can't.
    // - if we are backtracking, jump back to the parent
    var go = function (universe, item, mode, direction, _rules) {
      var rules = _rules !== undefined ? _rules : successors;
      // Perhaps an immediate index in might be better.
      var rule = Arr.find(rules, function (succ) {
        return succ.current === mode;
      });

      if (rule === undefined || rule === null) return Option.none();
      else {
        return rule.current(universe, item, direction, rule.next).orThunk(function () {
          return rule.fallback.bind(function (fb) {
            return go(universe, item, fb, direction)
          });
        });
      }
    };

    return {
      backtrack: backtrack,
      sidestep: sidestep,
      advance: advance,
      go: go
    };
  }
);