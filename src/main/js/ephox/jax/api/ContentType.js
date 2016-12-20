define(
  'ephox.jax.api.ContentType',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { none: [ ] },
      { form: [ 'data' ] },
      { json: [ 'data' ] },
      { plain: [ 'data' ] },
      { html: [ 'data' ] }
    ]);

    return {
      none: adt.none,
      form: adt.form,
      json: adt.json,
      plain: adt.plain
    };
  }
);