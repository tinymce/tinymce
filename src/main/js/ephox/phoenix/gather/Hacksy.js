define(
  'ephox.phoenix.gather.Hacksy',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.RobinWord',
    'ephox.scullion.Struct'
  ],

  function (Option, RobinWord, Struct) {
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

      var substring = function (text) {
        // Will need to generalise the word breaks.
        return RobinWord.leftBreak(text).map(function (index) {
          console.log('r-index at: ', index, '[' + text + ']');
          return [ index + 1, text.length ];
        });
      };

      var concat = function (start, rest) {
        return rest.concat(start);
      };

      return {
        sibling: sibling,
        first: first,
        substring: substring,
        concat: concat
      };
    };

    var right = function () {
      var sibling = function (universe, item) {
        return universe.query().nextSibling(item);
      };

      var first = function (children) {
        return children.length > 0 ? Option.some(children[0]) : Option.none();
      };

      var substring = function (text) {
        // Will need to generalise the word breaks.
        return RobinWord.rightBreak(text).map(function (index) {
          console.log('l-index at: ', index, '[' + text + ']');
          return [ 0, index ];
        });
      };

      var concat = function (start, rest) {
        return start.concat(rest);
      };

      return {
        sibling: sibling,
        first: first,
        substring: substring,
        concat: concat
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