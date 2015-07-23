define(
  'ephox.phoenix.api.dom.DomFamily',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Family'
  ],

  /**
   * Documentation is in the actual implementations.
   */
  function (DomUniverse, Family) {
    var universe = DomUniverse();

    var range = function (start, startDelta, finish, finishDelta) {
      return Family.range(universe, start, startDelta, finish, finishDelta);
    };

    var group = function (elements, optimise) {
      return Family.group(universe, elements, optimise);
    };

    return {
      range: range,
      group: group
    };
  }
);
