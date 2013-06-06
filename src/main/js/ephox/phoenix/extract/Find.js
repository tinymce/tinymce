define(
  'ephox.phoenix.extract.Find',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.ghetto.extract.GhettoFind'
  ],

  function (DomUniverse, GhettoFind) {
    var find = function (parent, offset) {
      return GhettoFind.find(DomUniverse(), parent, offset);
    };

    return {
      find: find
    };
  }
);
