define(
  'ephox.jax.api.Credentials',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { none: [ ] },
      { xhr: [ ] }
    ]);

    return {
      none: adt.none,
      xhr: adt.xhr
    };
  }
);