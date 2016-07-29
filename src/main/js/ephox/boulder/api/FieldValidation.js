define(
  'ephox.boulder.api.FieldValidation',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { none: [ ] },
      { validator: [ 'validator' ] }
    ]);

    return {
      none: adt.none,
      validator: adt.validator
    };
  }
);