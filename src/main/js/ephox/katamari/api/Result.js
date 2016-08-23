define(
  'ephox.katamari.api.Result',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    var value = function (r) {
      return result(function (e, v) {
        return v(r);
      });
    };

    var error = function (message) {
      return result(function (e, v) {
        return e(message);
      });
    };

    var result = function (fold) {

      var is = function (v) {
        return fold(Fun.constant(false), function (o) {
          return o === v;
        });
      };
      
      var isValue = function () {
        return fold(Fun.constant(false), Fun.constant(true));
      };

      var isError = Fun.not(isValue);

      var getOr = function (a) {
        return fold(Fun.constant(a), Fun.identity);
      };

      var getOrThunk = function (f) {
        return fold(f, Fun.identity);
      };

      var getOrDie = function () {
        return fold(function (m) {
          Fun.die(m)();
        }, Fun.identity);
      };

      var or = function (opt) {
        return fold(Fun.constant(opt), value);
      };

      var orThunk = function (f) {
        return fold(f, value);
      };

      var map = function (f) {
        return bind(function (a) {
          return value(f(a));
        });
      };

      var each = function (f) {
        fold(Fun.noop, f);
      };

      var bind = function (f) {
        return fold(error, f);
      };

      var exists = function (f) {
        return fold(Fun.constant(false), f);
      };

      var forall = function (f) {
        return fold(Fun.constant(true), f);
      };

      var toOption = function () {
        return fold(Option.none, Option.some);
      };
     
      return {
        is: is,
        isValue: isValue,
        isError: isError,
        getOr: getOr,
        getOrThunk: getOrThunk,
        getOrDie: getOrDie,
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        each: each,
        bind: bind,
        exists: exists,
        forall: forall,
        toOption: toOption
      };
    };

    return {
      value: value,
      error: error
    };


  }
);
