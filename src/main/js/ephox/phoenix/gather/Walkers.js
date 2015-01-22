define(
  'ephox.phoenix.gather.Walkers',

  [
    'ephox.perhaps.Option'
  ],

  function (Option) {
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
      left: left,
      right: right
    };
  }
);