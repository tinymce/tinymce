define(
  'ephox.jax.api.ContentType',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { file: [ 'data' ] },
      { form: [ 'data' ] },
      { json: [ 'data' ] },
      { plain: [ 'data' ] },
      { html: [ 'data' ] }
    ]);

    return {
      file: adt.file,
      form: adt.form,
      json: adt.json,
      plain: adt.plain,
      html: adt.html
    };
  }
);