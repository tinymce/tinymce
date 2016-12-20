define(
  'ephox.katamari.api.Results',

  [
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Arr'
  ],

  function (Adt, Arr) {
    var comparison = Adt.generate([
      { bothErrors: [ 'error1', 'error2' ] },
      { firstError: [ 'error1', 'value2' ] },
      { secondError: [ 'value1', 'error2' ] },
      { bothValues: [ 'value1', 'value2' ] }
    ]);

    /** partition :: [Result a] -> { errors: [String], values: [a] } */
    var partition = function (results) {
      var errors = [];
      var values = [];

      Arr.each(results, function (result) {
        result.fold(
          function (err)   { errors.push(err); },
          function (value) { values.push(value); }
        );
      });

      return { errors: errors, values: values };
    };

    /** compare :: (Result a, Result b) -> Comparison a b */
    var compare = function (result1, result2) {
      return result1.fold(function (err1) {
        return result2.fold(function (err2) {
          return comparison.bothErrors(err1, err2);
        }, function (val2) {
          return comparison.firstError(err1, val2);
        });
      }, function (val1) {
        return result2.fold(function (err2) {
          return comparison.secondError(val1, err2);
        }, function (val2) {
          return comparison.bothValues(val1, val2);
        });
      });
    };

    return {
      partition: partition,
      compare: compare
    };
  }
);