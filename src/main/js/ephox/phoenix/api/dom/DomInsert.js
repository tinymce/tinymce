define(
  'ephox.phoenix.api.dom.DomInsert',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Insert'
  ],

  function (DomUniverse, Insert) {
    var universe = DomUniverse();

    var atStartOf = function (element, offset, injection) {
      Insert.atStartOf(universe, element, offset, injection);
    };

    return {
      atStartOf: atStartOf
    };
  }
);
