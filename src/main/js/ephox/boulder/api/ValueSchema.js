define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.core.ValueProcessor',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (ValueProcessor, Json, Fun, Result, Error) {
    var anyValue = ValueProcessor.value(Result.value);

    var arrOfObj = function (objFields) {
      return ValueProcessor.arrOfObj(objFields);
    };

    var arrOfVal = function () {
      return ValueProcessor.arr(anyValue);
    };

    var arrOf = ValueProcessor.arr;

    var objOf = ValueProcessor.obj;

    var setOf = ValueProcessor.setOf;

    var valueOf = function (validator) {
      return ValueProcessor.value(validator);
    };

    var extract = function (label, prop, strength, obj) {
      return prop.extract([ label ], strength, obj).fold(function (errs) {
        return Result.error({
          input: obj,
          errors: errs
        });
      }, Result.value);
    };

    var asStruct = function (label, prop, obj) {
      return extract(label, prop, Fun.constant, obj);
    };

    var asRaw = function (label, prop, obj) {
      return extract(label, prop, Fun.identity, obj);
    };

    var getOrDie = function (extraction) {
      return extraction.fold(function (errInfo) {
        // A readable version of the error.
        return new Error(
          formatError(errInfo)
        );
      }, Fun.identity);
    };

    var asRawOrDie = function (label, prop, obj) {
      return getOrDie(asRaw(label, prop, obj));
    };

    var asStructOrDie = function (label, prop, obj) {
      return getOrDie(asStruct(label, prop, obj));
    };

    var formatError = function (errInfo) {
      return 'Errors: ' + Json.stringify(errInfo.errors, null, 2) + '\n\nInput object: ' + Json.stringify(errInfo.input, null, 2);
    };

    return {
      anyValue: Fun.constant(anyValue),

      arrOfObj: arrOfObj,
      arrOf: arrOf,
      arrOfVal: arrOfVal,

      valueOf: valueOf,
      setOf: setOf,

      objOf: objOf,

      asStruct: asStruct,
      asRaw: asRaw,

      asStructOrDie: asStructOrDie,
      asRawOrDie: asRawOrDie,

      getOrDie: getOrDie,
      formatError: formatError
    };
  }
);