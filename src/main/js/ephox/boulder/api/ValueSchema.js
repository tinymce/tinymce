define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.core.ValueProcessor',
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

    var arrOf = ValueProcessor.arr;

    var objOf = ValueProcessor.obj;

    var strictField = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), anyValue);
    };

    var strictArrayOfObj = function (key, objFields) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), arrOfObj(objFields));
    };

    var strictArrayOf = function (key, prop) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), prop);
    };

    var defaultField = function (key, fallback) {
      return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), anyValue);
    };

    var optionField = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.asOption(), anyValue);
    };

    var customField = function (key, okey, presence, prop) {
      return ValueProcessor.field(key, okey, presence, prop);
    };

    var state = function (okey, instantiator) {
      return ValueProcessor.state(okey, instantiator);
    };

    var fields = {
      strict: strictField,
      option: optionField,
      strictArrayOfObj: strictArrayOfObj,
      strictArrayOf: strictArrayOf,
      defaulted: defaultField,
      customField: customField,
      state: state
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
      arrOf: arrOf,
      arrOfVal: arrOfVal,

      objOf: objOf,

      fields: fields,

      asStruct: asStruct,
      asRaw: asRaw
    };
  }
);