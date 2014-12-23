define(
  'ephox.phoenix.gather.HacksyLeft',

  [
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Option, Struct) {
    var traverse = Struct.immutable('item', 'mode');
    var backtrack = function (universe, item) {
      return universe.property().parent(item).map(function (p) {
        return traverse(p, sidestep);
      });
    };

    var sidestep = function (universe, item) {
      return universe.query().prevSibling(item).map(function (p) {
        return traverse(p, advance);
      });
    };

    var advance = function (universe, item) {
      var children = universe.property().children(item);
      var result = children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
      return result.map(function (r) {
        return traverse(r, advance);
      });
    };

    var go = function (universe, item, mode) {
      if (mode === advance) {
        // try to advance, and if not, backtrack
        return advance(universe, item).orThunk(function () {
          return go(universe, item, sidestep);
        });
      } else if (mode === sidestep) {
        return sidestep(universe, item).orThunk(function () {
          return backtrack(universe, item);
        })
      } else {
        return backtrack(universe, item);
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