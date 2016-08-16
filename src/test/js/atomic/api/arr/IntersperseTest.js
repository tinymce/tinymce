test('Intersperse',

  [
    'ephox.katamari.api.Jam'
  ],

  function(Jam) {

    var check = function (expected, input, delimiter) {
      var actual = Jam.intersperse(input, delimiter);
      assert.eq(expected, actual);
    };

    var checkErr = function (expected, input, delimiter) {
      try {
        Jam.intersperse(input, delimiter);
        jssert.fail('Excpected exception: ' + expected + ' from input: ' + input + ' with delimiter: ' + delimiter);
      } catch (e) {
        assert.eq(expected, e);
      }
    };

    check([], [], 2);
    check([1], [1], 2);
    check([1,2,1,2,1], [1,1,1], 2);
    check(['a', 3, 'a', 3, 'a'], ['a', 'a', 'a'], 3);
    check([[1], [4], [1]], [[1], [1]], [4]);
    checkErr('Cannot intersperse undefined', undefined, 2);
  }
);