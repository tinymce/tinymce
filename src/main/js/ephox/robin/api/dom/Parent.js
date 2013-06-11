define(
  'ephox.robin.api.dom.Parent',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.robin.api.general.Parent'
  ],

  function (DomUniverse, Parent) {
    var universe = DomUniverse();

    var sharedOne = function (look, elements) {
      return Parent.sharedOne(universe, function (element) {
        return look(universe, element);
      }, elements);
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
      breakAt: breakAt
    };
  }
);
