define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.ValueProcessor',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, ValueProcessor, Json, Fun, Result) {
    var anyValue = ValueProcessor.value(Result.value);

    var arrOfObj = function (objFields) {
      return ValueProcessor.arr(
        ValueProcessor.obj(objFields)
      );
    };

    var arrOfVal = function () {
      return ValueProcessor.arr(anyValue);
    };

    var strictField = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), anyValue);
    };

    var strictArrayOfObj = function (key, objFields) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), arrOfObj(objFields));
    };

    var fields = {
      strict: strictField,
      strictArrayOfObj: strictArrayOfObj
    };

    var extract = function (label, prop, strength, obj) {
      return prop.extract([ label ], strength, obj).fold(function (errs) {
        return Result.error(errs + '\n\nComplete object: \n' + Json.stringify(obj, null, 2));
      }, Result.value);
    };

    var asStruct = function (label, prop, obj) {
      return extract(label, prop, Fun.constant, obj);
    };

    var asRaw = function (label, prop, obj) {
      return extract(label, prop, Fun.identity, obj);
    };

    return {
      anyValue: Fun.constant(anyValue),

      arrOfObj: arrOfObj,
      arrOfVal: arrOfVal,

      fields: fields,

      asStruct: asStruct,
      asRaw: asRaw
    };
  }
);