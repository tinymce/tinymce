define(
  'ephox.phoenix.gather.Hacksy',

  [
    'ephox.perhaps.Option',
    'ephox.scullion.Struct'
  ],

  function (Option, Struct) {
    var traverse = Struct.immutable('item', 'mode');
    var backtrack = function (universe, item, direction) {
      return universe.property().parent(item).map(function (p) {
        return traverse(p, sidestep);
      });
    };

    var sidestep = function (universe, item, direction) {
      return direction.sibling(universe, item).map(function (p) {
        return traverse(p, advance);
      });
    };

    var advance = function (universe, item, direction) {
      var children = universe.property().children(item);
      var result = direction.first(children);
      return result.map(function (r) {
        return traverse(r, advance);
      });
    };

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

    var left = function () {
      var sibling = function (universe, item) {
        return universe.query().prevSibling(item);
      };

      var first = function (children) {
        return children.length > 0 ? Option.some(children[children.length - 1]) : Option.none();
      };

      return {
        sibling: sibling,
        first: first
      };
    };

    var right = function () {
      var sibling = function (universe, item) {
        return universe.query().nextSibling(item);
      };

      var first = function (children) {
        return children.length > 0 ? Option.some(children[0]) : Option.none();
      };

      return {
        sibling: sibling,
        first: first
      };
    };

    return {
      backtrack: backtrack,
      sidestep: sidestep,
      advance: advance,
      go: go,
      left: left,
      right: right
    };
  }
);