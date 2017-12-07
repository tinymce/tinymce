define(
  'ephox.jax.api.ContentType',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { form: [ 'data' ] },
      { json: [ 'data' ] },
      { plain: [ 'data' ] },
      { html: [ 'data' ] }
    ]);

    return {
      form: adt.form,
      json: adt.json,
      plain: adt.plain
    };
  }
);