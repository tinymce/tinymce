define(
  'ephox.agar.server.SeleniumAction',

  [
    'ephox.agar.api.Step',
    'ephox.jax.api.Ajax',
    'ephox.jax.api.ContentType',
    'ephox.jax.api.Credentials',
    'ephox.jax.api.ResponseType'
  ],

  function (Step, Ajax, ContentType, Credentials, ResponseType) {
    var sPerform = function (path, info) {
      return Step.async(function (next, die) {
        Ajax.post(
          path,
          ContentType.json(info),
          ResponseType.json(),
          Credentials.none(),
          { }
        ).get(function (res) {
          res.fold(die, function () {
            next();
          });
        });
      });
    };

    return {
      sPerform: sPerform
    };
  }
);