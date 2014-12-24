define(
  'ephox.phoenix.gather.LeafGather',

  [
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.Hacksy'
  ],

  function (Option, Hacksy) {
    /*
     * Go in one particular direction until you find a leaf node.
     */

    var doHone = function (universe, item, predicate, mode, direction) {
      var next = Hacksy.go(universe, item, mode, direction);
      return next.bind(function (n) {
        return predicate(n.item()) ? Option.some(n.item()) : hone(universe, n.item(), n.mode(), direction)
      });
    };

    var before = function (universe, item, predicate) {
      // will need to consider isRoot
      return doHone(universe, item, predicate, Hacksy.advance, Hacksy.left());
    };

    var after = function (universe, item, predicate) {
      return doHone(universe, item, predicate, Hacksy.advance, Hacksy.right());
    };

    return {
      before: before,
      after: after
    };
  }
);