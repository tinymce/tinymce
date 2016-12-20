define(
  'ephox.jax.api.Methods',

  [
    'ephox.katamari.api.Adt'
  ],

  function (Adt) {
    var adt = Adt.generate([
      { get: [ ] },
      { post: [ ] },
      { put: [ ] },
      { del: [ ] }
    ]);

    return {
      get: adt.get,
      post: adt.post,
      put: adt.put,
      del: adt.del
    };
  }
);