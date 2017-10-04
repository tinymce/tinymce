define(
  'ephox.boulder.api.ValueSchema',

  [
    'ephox.boulder.core.ChoiceProcessor',
    'ephox.boulder.core.ValueProcessor',
    'ephox.boulder.format.PrettyPrinter',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'global!Error'
  ],

  function (ChoiceProcessor, ValueProcessor, PrettyPrinter, Fun, Result, Error) {
    var anyValue = ValueProcessor.value(Result.value);

    var arrOfObj = function (objFields) {
      return ValueProcessor.arrOfObj(objFields);
    };

    var arrOfVal = function () {
      return ValueProcessor.arr(anyValue);
    };

    var arrOf = ValueProcessor.arr;

    var objOf = ValueProcessor.obj;

    var objOfOnly = ValueProcessor.objOnly;

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
      return 'Errors: \n' + PrettyPrinter.formatErrors(errInfo.errors) + 
        '\n\nInput object: ' + PrettyPrinter.formatObj(errInfo.input);
    };

    var choose = function (key, branches) {
      return ChoiceProcessor.choose(key, branches);
    };

    var thunkOf = function (desc, schema) {
      return ValueProcessor.thunk(desc, schema);
    };

    var func = function (args, schema) {
      return ValueProcessor.value(function (f, strength) {
        return Result.value(function () {
          var gArgs = Array.prototype.slice.call(arguments, 0);
          var allowedArgs = gArgs.slice(0, args.length);
          var response = f.apply(null, allowedArgs);
          return getOrDie(
            extract('()', schema, strength, response)
          );
        });
      }); 
    };

    return {
      anyValue: Fun.constant(anyValue),

      arrOfObj: arrOfObj,
      arrOf: arrOf,
      arrOfVal: arrOfVal,

      valueOf: valueOf,
      setOf: setOf,

      objOf: objOf,
      objOfOnly: objOfOnly,

      asStruct: asStruct,
      asRaw: asRaw,

      asStructOrDie: asStructOrDie,
      asRawOrDie: asRawOrDie,

      getOrDie: getOrDie,
      formatError: formatError,

      choose: choose,

      thunkOf: thunkOf,

      func: func
    };
  }
);