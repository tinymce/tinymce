define(
  'ephox.phoenix.api.general.Family',

  [
    'ephox.phoenix.family.Group',
    'ephox.phoenix.family.Range'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (Group, Range) {
    var range = function (universe, start, startDelta, finish, finishDelta) {
      return Range.range(universe, start, startDelta, finish, finishDelta);
    };

    var group = function (universe, items, optimise) {
      return Group.group(universe, items, optimise);
    };

    return {
      range: range,
      group: group
    };

  }
);
