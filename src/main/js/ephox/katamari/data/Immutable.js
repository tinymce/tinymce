define(
  'ephox.katamari.data.Immutable',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'global!Array'
  ],

  function (Arr, Fun, Array) {
    return function () {
      var fields = arguments;
      return function(/* values */) {
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
    };
  }
);
