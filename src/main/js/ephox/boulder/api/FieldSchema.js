define(
  'ephox.boulder.api.FieldSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.core.ValueProcessor'
  ],

  function (FieldPresence, ValueProcessor) {
    var strict = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
    };

    var strictArrayOfObj = function (key, objFields) {
      return ValueProcessor.field(
        key,
        key,
        FieldPresence.strict(),
        ValueProcessor.arrOfObj(objFields)
      );
    };

    var strictArrayOf = function (key, prop) {
      return ValueProcessor.field(key, key, FieldPresence.strict(), prop);
    };

    var defaulted = function (key, fallback) {
      return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
    };

    var option = function (key) {
      return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
    };

    var field = function (key, okey, presence, prop) {
      return ValueProcessor.field(key, okey, presence, prop);
    };

    var state = function (okey, instantiator) {
      return ValueProcessor.state(okey, instantiator);
    };

    return {
      strict: strict,
      option: option,
      strictArrayOfObj: strictArrayOfObj,
      strictArrayOf: strictArrayOf,
      defaulted: defaulted,
      field: field,
      state: state

      // snapshot?
    };
  }
);