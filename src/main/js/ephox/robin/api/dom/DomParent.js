define(
  'ephox.robin.api.dom.DomParent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Parent'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Parent) {
    var universe = DomUniverse();

    var sharedOne = function (look, elements) {
      return Parent.sharedOne(universe, function (universe, element) {
        return look(element);
      }, elements);
    };

    var subset = function (start, finish) {
      return Parent.subset(universe, start, finish);
    };

    var breakAt = function (parent, child) {
      return Parent.breakAt(universe, parent, child);
    };

    var breakPath = function (child, isTop, breaker) {
      return Parent.breakPath(universe, child, isTop, function (u, p, c) {
        return breaker(p, c);
      });
    };

    return {
      sharedOne: sharedOne,
      subset: subset,
      breakAt: breakAt,
      breakPath: breakPath
    };
  }
);
