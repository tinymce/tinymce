define(
  'ephox.phoenix.util.arr.PositionArray',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (Arr, Fun, Option) {

    var make = function (xs, f) {

      var init = {
        len: 0,
        list: []
      };

      var r = Arr.foldl(xs, function (b, a) {
        var value = f(a, b.len);
        return value.fold(Fun.constant(b), function (v) {
          return {
            len: v.finish(),
            list: b.list.concat([v])
          };
        });
      }, init);

      return r.list;
    };

    var getAt = function (list, count) {
      var item = Arr.find(list, function (x) {
        return x.start() <= count && x.finish() >= count;
      });

      return Option.from(item);
    };

    return {
      make: make,
      getAt: getAt
    };
  }
);
