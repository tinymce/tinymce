define(
  'ephox.katamari.api.Result',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    /* The type signatures for Result 
     * is :: this Result a -> a -> Bool
     * or :: this Result a -> Result a -> Result a
     * orThunk :: this Result a -> (_ -> Result a) -> Result a
     * map :: this Result a -> (a -> b) -> Result b
     * each :: this Result a -> (a -> _) -> _ 
     * bind :: this Result a -> (a -> Result b) -> Result b
     * fold :: this Result a -> (_ -> b, a -> b) -> b
     * exists :: this Result a -> (a -> Bool) -> Bool
     * forall :: this Result a -> (a -> Bool) -> Bool
     * toOption :: this Result a -> Option a
     * isValue :: this Result a -> Bool
     * isError :: this Result a -> Bool
     * getOr :: this Result a -> a -> a
     * getOrThunk :: this Result a -> (_ -> a) -> a
     * getOrDie :: this Result a -> a (or throws error)
    */

    var value = function (o) {
      var is = function (v) {
        return o === v;      
      };

      var or = function (opt) {
        return value(o);
      };

      var orThunk = function (f) {
        return value(o);
      };

      var map = function (f) {
        return value(f(o));
      };

      var each = function (f) {
        f(o);
      };

      var bind = function (f) {
        return f(o);
      };

      var fold = function (_, onValue) {
        return onValue(o);
      };

      var exists = function (f) {
        return f(o);
      };

      var forall = function (f) {
        return f(o);
      };

      var toOption = function () {
        return Option.some(o);
      };
     
      return {
        is: is,
        isValue: Fun.constant(true),
        isError: Fun.constant(false),
        getOr: Fun.constant(o),
        getOrThunk: Fun.constant(o),
        getOrDie: Fun.constant(o),
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

    var error = function (message) {
      var getOrThunk = function (f) {
        return f();
      };

      var getOrDie = function () {
        return Fun.die(message)();
      };

      var or = function (opt) {
        return opt;
      };

      var orThunk = function (f) {
        return f();
      };

      var map = function (f) {
        return error(message);
      };

      var bind = function (f) {
        return error(message);
      };

      var fold = function (onError, _) {
        return onError(message);
      };

      return {
        is: Fun.constant(false),
        isValue: Fun.constant(false),
        isError: Fun.constant(true),
        getOr: Fun.identity,
        getOrThunk: getOrThunk,
        getOrDie: getOrDie,
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        each: Fun.noop,
        bind: bind,
        exists: Fun.constant(false),
        forall: Fun.constant(true),
        toOption: Option.none
      };
    };

    return {
      value: value,
      error: error
    };
  }
);
