define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.ValueProcessor',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, ValueProcessor, Result) {
    var anyValue = ValueProcessor.value(Result.value);

    var arrOfObj = function (path, objFields) {
      return ValueProcessor.arr(
        ValueProcessor.obj(path, objFields)
      );
    };

    var arrOfVal = function () {
      return ValueProcessor.arr(anyValue);
    };

    var strictField = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), anyValue);
    };

    var fields = {
      strict: strictField
    };

    return {
      arrOfObj: arrOfObj,
      arrOfVal: arrOfVal,

      fields: fields
    };
  }
);