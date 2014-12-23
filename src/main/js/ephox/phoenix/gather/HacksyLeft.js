define(
  'ephox.phoenix.gather.HacksyLeft',

  [
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Option, Struct) {
    var traverse = Struct.immutable('item', 'mode');
    var backtrack = function (universe, item) {
      return universe.query().prevSibling(item).fold(function () {
        return universe.property().parent(item).bind(function (parent) {
          return backtrack(universe, parent);
        });
      }, function (p) {
        return Option.some(traverse(p, advance));
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
          return go(universe, item, backtrack);
        });
      } else {
        return backtrack(universe, item);
      }
    };

    return {
      backtrack: backtrack,
      advance: advance,
      go: go
    };
  }
);