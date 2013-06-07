define(
  'ephox.phoenix.api.dom.DomFamily',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Family'
  ],

  function (DomUniverse, Family) {
    var universe = DomUniverse();

    var range = function (start, startDelta, finish, finishDelta) {
      return Family.range(universe, start, startDelta, finish, finishDelta);
    };

    var left = function (element, offset) {
      return Family.left(universe, element, offset);
    };

    var right = function (element, offset) {
      return Family.right(universe, element, offset);
    };

    var group = function (elements) {
      return Family.group(universe, elements);
    };

    return {
      range: range,
      left: left,
      right: right,
      group: group
    };
  }
);
