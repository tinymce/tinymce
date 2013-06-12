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

    var group = function (universe, items) {
      return Group.group(universe, items);
    };

    return {
      range: range,
      group: group
    };

  }
);
