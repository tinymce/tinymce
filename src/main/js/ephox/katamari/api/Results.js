define(
  'ephox.katamari.api.Results',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
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

    return {
      partition: partition
    };
  }
);