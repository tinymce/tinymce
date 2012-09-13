define(
  'ephox.phoenix.util.arr.LinkedArray',

  [
    'ephox.compass.Arr',
    'ephox.scullion.Struct'
  ],

  function (Arr, Struct) {
    var Info = Struct.immutable('prev', 'value');

    var link = function (values, head) {
      if (values.length === 0) return values;

      var r = Arr.foldl(values, function (acc, x) {
        return {
          prev: x,
          xs: acc.xs.concat([Info(acc.prev, x)])
        };
      }, { prev: head, xs: [] });

      return r.xs;
    };

    return {
      link: link
    };
  }
);
