define(
  'ephox.alloy.alien.PositionArray',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (Arr, Fun) {
    /**
     * Generate a PositionArray
     *
     * xs:     list of thing
     * f:      thing -> Optional unit
     * _start: sets the start position to search at
     */
    var generate = function (xs, f) {

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

    return {
      generate: generate
    };
  }
);
