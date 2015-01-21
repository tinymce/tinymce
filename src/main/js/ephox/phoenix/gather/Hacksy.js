define(
  'ephox.phoenix.gather.Hacksy',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.RobinWord',
    'ephox.phoenix.gather.Walker',
    'ephox.scullion.Struct'
  ],

  function (Option, RobinWord, Walker, Struct) {
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
          return [ index + 1, text.length ];
        });
      };

      return {
        sibling: sibling,
        first: first,
        substring: substring
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
          return [ 0, index ];
        });
      };

      return {
        sibling: sibling,
        first: first,
        substring: substring
      };
    };

    return {
      backtrack: Walker.backtrack,
      sidestep: Walker.sidestep,
      advance: Walker.advance,
      go: Walker.go,
      left: left,
      right: right
    };
  }
);