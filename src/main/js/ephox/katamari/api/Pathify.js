define(
  'ephox.katamari.api.Pathify',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Obj'
  ],

  function (Type, Obj) {


    var paths = function (path, obj, f) {
      var r = Obj.map(obj, function (x, i) {
        return Type.isObject(x) ? paths(path.concat([i]), x, f) : x;
      });
      return f(r, path);
    };

    var pathify = function (obj, f) {
      return paths([], obj, f);
    };

    return {
      pathify: pathify
    };
  }
);