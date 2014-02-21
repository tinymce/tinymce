define(
  'ephox.phoenix.api.general.Injection',

  [
    'ephox.phoenix.injection.Injection'
  ],

  function (Injection) {
    var atStartOf = function (universe, element, offset, injection) {
      Injection.atStartOf(universe, element, offset, injection);
    };

    return {
      atStartOf: atStartOf
    };
  }
);
