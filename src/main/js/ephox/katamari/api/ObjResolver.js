define(
  'ephox.katamari.api.ObjResolver',

  [
    'ephox.katamari.api.Global'
  ],

  function (Global) {
    var path = function (parts, scope) {
      var o = scope !== undefined ? scope : Global;
      for (var i = 0; i < parts.length && o !== undefined && o !== null; ++i)
        o = o[parts[i]];
      return o;
    };

    var resolve = function (p, scope) {
      var parts = p.split('.');
      return path(parts, scope);
    };

    var step = function (o, part) {
      if (o[part] === undefined || o[part] === null)
        o[part] = {};
      return o[part];
    };

    var namespace = function (name, target) {
      var o = target !== undefined ? target : Global;
      var parts = name.split('.');
      for (var i = 0; i < parts.length; ++i)
        o = step(o, parts[i]);
      return o;
    };

    return {
      path: path,
      resolve: resolve,
      namespace: namespace
    };
  }
);

