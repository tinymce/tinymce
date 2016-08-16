define(
  'ephox.katamari.data.Immutable2',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Fun',
    'global!Array'
  ],

  function (Arr, Obj, Fun, Array) {
    var product = function(fields, eqs) {

      var nu = function(/* values */) {
        // TBIO-4011: Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
        var values = new Array(arguments.length);
        for (var i = 0; i < values.length; i++) values[i] = arguments[i];

        if (fields.length !== values.length)
          throw 'Wrong number of arguments to struct. Expected "[' + fields.length + ']", got ' + values.length + ' arguments';

        var struct = {};
        Arr.each(fields, function (name, i) {
          struct[name] = Fun.constant(values[i]);
        });
        return struct;
      };

      var eq = function(a, b) {
        for (var i = 0; i < fields.length; i++) {
          var qqq = (eqs && eqs[i]) || Fun.tripleEquals;
          var x = fields[i];
          if (!qqq(a[x](), b[x]())) {
            return false;
          }
        }
        return true;
      };

      var evaluate = function(o) {
        return Obj.map(o, function(f) {
          return f();
        });
      };

      return {
        nu: nu,
        eq: eq,
        evaluate: evaluate
      };
    };

    return {
      product: product
    };
  }
);
