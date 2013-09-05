define(
  'ephox.robin.api.dom.DomParent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Parent'
  ],

  function (DomUniverse, Parent) {
    var universe = DomUniverse();

    var sharedOne = function (look, elements) {
      return Parent.sharedOne(universe, function (universe, element) {
        return look(element);
      }, elements);
    };

    var lookFor = function (element) {
      return Parent.lookFor(universe, element);
    };

    var lookUntil = function (pred) {
      return Parent.lookUntil(universe, predicate);
    };

    var subset = function (start, finish) {
      return Parent.subset(universe, start, finish);
    };

    var breakAt = function (parent, child) {
      return Parent.breakAt(universe, parent, child);
    };

    return {
      sharedOne: sharedOne,
      subset: subset,
      lookFor: lookFor,
      lookUntil: lookUntil,
      breakAt: breakAt
    };
  }
);
