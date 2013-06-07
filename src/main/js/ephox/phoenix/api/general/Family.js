define(
  'ephox.phoenix.api.general.Family',

  [
    'ephox.phoenix.family.Group',
    'ephox.phoenix.family.Range'
  ],

  function (Group, Range) {
    var range = function (universe, start, startDelta, finish, finishDelta) {
      return Range.range(universe, start, startDelta, finish, finishDelta);
    };

    var left = function (universe, item, offset) {

    };

    var right = function (universe, item, offset) {

    };

    var group = function (universe, items) {
      return Group.group(universe, items);
    };

    return {
      range: range,
      left: left,
      right: right,
      group: group
    };

  }
);
