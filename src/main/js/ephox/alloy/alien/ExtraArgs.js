define(
  'ephox.alloy.alien.ExtraArgs',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'global!Array'
  ],

  function (Arr, Fun, Adt, Array) {
    var adt = Adt.generate([
      { eager: [ 'value' ] },
      { lazy: [ 'thunk' ] }
    ]);

    var augment = function (f, extraArgs) {
      return function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var extra = get(extraArgs);
        return f.apply(undefined, extra.concat(args));
      };
    };

    var get = function (args) {
      return Arr.map(args, function (arg) {
        return arg.fold(Fun.identity, Fun.apply);
      });
    };

    return {
      eager: adt.eager,
      lazy: adt.lazy,

      augment: augment,
      get: get
    };
  }
);