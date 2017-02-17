define(
  'ephox.boulder.format.PrettyPrinter',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Type',
    'ephox.sand.api.JSON'
  ],

  function (Arr, Obj, Type, JSON) {
    var formatObj = function (input) {
      return Type.isObject(input) && Obj.keys(input).length > 100 ? ' removed due to size' : JSON.stringify(input, null, 2);

    };

    var formatErrors = function (errors) {
      var es = errors.length > 10 ? errors.slice(0, 10).concat([
        {
          path: [ ],
          getErrorInfo: function () {
            return '... (only showing first ten failures)';
          }
        }
      ]) : errors;

      // TODO: Work out a better split between PrettyPrinter and SchemaError
      return Arr.map(es, function (e) {
        return 'Failed path: ('  + e.path.join(' > ') + ')\n' + e.getErrorInfo();
      });
    };

    return {
      formatObj: formatObj,
      formatErrors: formatErrors
    };
  }
);