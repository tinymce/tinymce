define(
  'ephox.boulder.api.FieldPresence',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Fun'
  ],

  function (Adt, Fun) {
    var adt = Adt.generate([
      { strict: [ ] },
      { defaultedThunk: [ 'fallbackThunk' ] },
      { asOption: [ ] },
      { asDefaultedOptionThunk: [ 'fallbackThunk' ] },
      { mergeWithThunk: [ 'baseThunk' ] }
    ]);

    var defaulted = function (fallback) {
      return adt.defaultedThunk(
        Fun.constant(fallback)
      );
    };

    var asDefaultedOption = function (fallback) {
      return adt.asDefaultedOptionThunk(
        Fun.constant(fallback)
      );
    };

    var mergeWith = function (base) {
      return adt.mergeWithThunk(
        Fun.constant(base)
      );
    };

    return {
      strict: adt.strict,
      asOption: adt.asOption,
      
      defaulted: defaulted,
      defaultedThunk: adt.defaultedThunk,
      
      asDefaultedOption: asDefaultedOption,      
      asDefaultedOptionThunk: adt.asDefaultedOptionThunk,

      mergeWith: mergeWith,
      mergeWithThunk: adt.mergeWithThunk
    };
  }
);