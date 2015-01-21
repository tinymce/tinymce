define(
  'ephox.phoenix.gather.Walker',

  [
    'ephox.scullion.Struct'
  ],

  function (Struct) {
    var traverse = Struct.immutable('item', 'mode');

    // Jump back to the parent, with sidestep the next action.
    var backtrack = function (universe, item, direction) {
      return universe.property().parent(item).map(function (p) {
        return traverse(p, sidestep);
      });
    };

    // Jump to the sibling, with advance the next action
    var sidestep = function (universe, item, direction) {
      return direction.sibling(universe, item).map(function (p) {
        return traverse(p, advance);
      });
    };

    // Jump to the child, with advance the next action
    var advance = function (universe, item, direction) {
      var children = universe.property().children(item);
      var result = direction.first(children);
      return result.map(function (r) {
        return traverse(r, advance);
      });
    };

    // Rules:
    // - if we are advancing ... try to advance. If we have no children to advance to,
    //   then we try again with mode = sidestep
    // - if we are sidestepping ... try to sidestep, but jump back to the parent if we can't.
    // - if we are backtracking, jump back to the parent
    var go = function (universe, item, mode, direction) {
      if (mode === advance) {
        // try to advance, and if not, backtrack
        return advance(universe, item, direction).orThunk(function () {
          return go(universe, item, sidestep, direction);
        });
      } else if (mode === sidestep) {
        return sidestep(universe, item, direction).orThunk(function () {
          return backtrack(universe, item, direction);
        })
      } else {
        return backtrack(universe, item, direction);
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