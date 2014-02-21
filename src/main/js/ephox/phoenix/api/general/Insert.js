define(
  'ephox.phoenix.api.general.Insert',

  [
    'ephox.phoenix.insert.InsertAt'
  ],

  function (InsertAt) {
    var atStartOf = function (universe, element, offset, injection) {
      InsertAt.atStartOf(universe, element, offset, injection);
    };

    return {
      atStartOf: atStartOf
    };
  }
);
