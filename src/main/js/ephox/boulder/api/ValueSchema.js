define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.ValueProcessor',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, ValueProcessor, Fun, Result) {
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

    return {
      anyValue: Fun.constant(anyValue),

      arrOfObj: arrOfObj,
      arrOfVal: arrOfVal,

      fields: fields
    };
  }
);