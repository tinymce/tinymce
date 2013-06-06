define(
  'ephox.phoenix.group.Group',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.family.GhettoGroup'
  ],

  function (DomUniverse, GhettoGroup) {
    var universe = DomUniverse();

    var group = function (elements) {
      return GhettoGroup.group(universe, elements);
    };

    return {
      group: group
    };

  }
);
