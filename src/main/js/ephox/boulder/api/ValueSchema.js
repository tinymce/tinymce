define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.core.ChoiceProcessor',
    'ephox.boulder.core.ValueProcessor',
    'ephox.compass.Arr',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (ChoiceProcessor, ValueProcessor, Arr, Json, Fun, Result, Error) {
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
        throw new Error(
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
      return 'Errors: \n' + Arr.map(errInfo.errors, function (error) {
        return 'Failed path: ('  + error.path.join(' > ') + ')\n' + error.err;
      }).join('\n\n') + '\n\nInput object: ' + Json.stringify(errInfo.input, null, 2);
    };

    // The purpose of oneof is that all of the field schemas
    var choose = function (key, branches) {
      return ChoiceProcessor.choose(key, branches);
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
      formatError: formatError,

      choose: choose
    };
  }
);