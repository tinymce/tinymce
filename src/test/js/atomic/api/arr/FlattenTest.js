test(
  'FlattenTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.wrap.Jsc'
  ],

  function (Arr, Jsc) {

    Jsc.property("Wrap then flatten array is identity", "[json]", function(arr) {
      return Jsc.eq(
        Arr.flatten(Arr.pure(arr)),
        arr
      );
    });

    Jsc.property("Mapping pure then flattening array is identity", "[json]", function(arr) {
      return Jsc.eq(
        Arr.flatten(Arr.map(arr, Arr.pure)),
        arr
      );
    });

    Jsc.property("Flattening two lists === concat", "[json]", "[json]", function(xs, ys) {
      return Jsc.eq(
        Arr.flatten([xs, ys]),
        xs.concat(ys)
      );
    });

    var check = function (expected, input) {
      assert.eq(expected, Arr.flatten(input));
    };

    check([], []);
    check([1], [[1]]);
    check([1, 2], [[1], [2]]);
    check([1, 2, 3, 4, 5], [[1, 2], [], [3], [4, 5], []]);
  }
);
