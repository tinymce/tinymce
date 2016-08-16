define(
  'ephox.katamari.api.Namespace',

  [
    'ephox.katamari.api.Global'
  ],

  function (Global) {
    var step = function (o, part) {
      if (o[part] === undefined || o[part] === null)
        o[part] = {};
      return o[part];
    };

    var namespace = function (name, target) {
      var o = target || Global;
      var parts = name.split('.');
      for (var i = 0; i < parts.length; ++i)
        o = step(o, parts[i]);
      return o;
    };

    return {
      namespace: namespace
    };
  }
);

