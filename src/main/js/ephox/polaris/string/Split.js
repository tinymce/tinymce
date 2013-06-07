define(
  'ephox.polaris.string.Split',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var splits = function (value, indices) {
      if (indices.length === 0) return [value];
      var divisions = Arr.foldl(indices, function (acc, x) {
        var part = value.substring(acc.prev, x);
        return {
          prev: x,
          values: acc.values.concat([part])
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
