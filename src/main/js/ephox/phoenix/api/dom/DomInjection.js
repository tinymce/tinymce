define(
  'ephox.phoenix.api.dom.DomInjection',

  [
    'ephox.boss.api.DomUniverse',
    'ephox.phoenix.api.general.Injection'
  ],

  function (DomUniverse, Injection) {
    var universe = DomUniverse();

    var atStartOf = function (element, offset, injection) {
      Injection.atStartOf(universe, element, offset, injection);
    };

    return {
      atStartOf: atStartOf
    };
  }
);
