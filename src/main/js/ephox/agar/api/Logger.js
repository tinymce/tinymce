define(
  'ephox.agar.api.Logger',

  [
    'ephox.agar.alien.ErrorTypes',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (ErrorTypes, Arr, Fun) {
    var t = function (label, f) {
      var enrich = function (err) {
        return ErrorTypes.enrichWith(label, err);
      };

      return function (value, next, die) {
        var dieWith = Fun.compose(die, enrich);
        try {
          f(value, next, dieWith);
        } catch (err) {
          dieWith(err);
        }
      };
    };

    var sync = function (label, f) {
      var enrich = function (err) {
        return ErrorTypes.enrichWith(label, err);
      };

      try {
        f();
      } catch (err) {
        throw enrich(err);
      }
    };

    var ts = function (label, fs) {
      if (fs.length === 0) return fs;
      return Arr.map(fs, function (f, i) {
        return t(label + '(' + i + ')', f);
      });
    };

    var suite = function () {
      // TMP, WIP
    };

    var spec = function (msg) {
      // TMP, WIP
      console.log(msg);
    };

    return {
      t: t,
      ts: ts,
      sync: sync,
      suite: suite,
      spec: spec
    };
  }
);