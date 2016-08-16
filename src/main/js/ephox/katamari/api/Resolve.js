define(
  'ephox.katamari.api.Resolve',

  [
    'ephox.katamari.api.Global'
  ],

  function (Global) {
    var path = function (parts, scope) {
      var o = scope || Global;
      for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
        o = o[parts[i]];
      return o;
    };

    var resolve = function (p, scope) {
      var parts = p.split('.');
      return path(parts, scope);
    };

    return {
      path: path,
      resolve: resolve
    };
  }
);

