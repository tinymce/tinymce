define(
  'ephox.boulder.api.FieldValidation',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { none: [ ] }
    ]);

    return {
      none: adt.none
    };
  }
);