define(
  'ephox.porkbun.Struct',

  [
    'ephox.wrap.D'
  ],

  function (D) {
    //TODO: Move into D
    var immutable = function (/* fields */) {
      var those = Array.prototype.slice.call(arguments);
      return function(/* fields */) {
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
      immutable: immutable
    };
  }
);
