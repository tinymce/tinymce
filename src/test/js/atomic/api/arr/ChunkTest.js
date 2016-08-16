test(
  'ChunkTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {

    var check = function (expected, initial, size) {
      assert.eq(expected, Arr.chunk(initial, size));
    };

    check([[ 1, 2, 3 ], [4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  3);
    check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  6);
    check([[ 1, 2, 3, 4, 5, 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  12);
    check([[ 1 ], [ 2 ], [ 3 ], [ 4 ], [ 5 ], [ 6 ]],  [ 1, 2, 3, 4, 5, 6 ],  1);
    check([[ 1, 2, 3, 4 ], [ 5, 6, 7, 8 ], [ 9, 10 ]],  [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],  4);
    check([], [], 2);
  }
);
