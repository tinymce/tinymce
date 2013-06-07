define(
  'ephox.polaris.split.Strings',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    /* Note: Changed this so that it didn't return empty strings (value ternary) */
    var splits = function (value, indices) {
      if (indices.length === 0) return [value];
      var divisions = Arr.foldl(indices, function (acc, x) {
        var part = value.substring(acc.prev, x);
        return {
          prev: x,
          values: part.length ? acc.values.concat([part]) : acc.values
        };
      }, { prev: 0, values: [] });

      var lastPoint = indices[indices.length - 1];
      return lastPoint < value.length ? divisions.values.concat(value.substring(lastPoint)) : divisions.values;
    };

    return {
      splits: splits
    };

  }
);
