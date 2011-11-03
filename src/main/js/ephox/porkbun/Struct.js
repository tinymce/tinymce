define(
  'ephox.porkbun.Struct',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    //TODO: Move into D
    var d_dot_immutableFactory = function (/* fields */) {
      var those = Array.prototype.slice.call(arguments);
      return function(/* values */) {
        var these = Array.prototype.slice.call(arguments);
        if (these.length !== those.length)
          throw "Wrong number of arguments to struct";

        var struct = {};
        D(those).each(function (name, i) {
          struct[name] = D.getConstant(these[i]);
        });
        return struct;
      }
    };

    return {
      immutable: d_dot_immutableFactory
    };
  }
);
