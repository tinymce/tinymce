define(
  'ephox.boulder.api.FieldPresence',

  [
    'ephox.scullion.ADT'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { strict: [ ] },
      { defaulted: [ 'fallback' ] },
      { asOption: [ ] },
      { asDefaultedOption: [ 'fallback' ] }
    ]);

    return {
      strict: adt.strict,
      defaulted: adt.defaulted,
      asOption: adt.asOption,
      asDefaultedOption: adt.asDefaultedOption
    };
  }
);