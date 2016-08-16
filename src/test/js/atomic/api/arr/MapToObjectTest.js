test(
  'MapToObjectTest',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    var check = function(expected, input, f) {
      assert.eq(expected, Arr.mapToObject(input, f));
    };

    check({}, [], function() { throw 'boom'; });
    check({'a': '3a'}, ['a'], function(x) { return 3 + x; });
    check({'a': '3a', 'b': '3b'}, ['a', 'b'], function(x) { return 3 + x; });
    check({'1': 4, '2': 5}, [1, 2], function(x) { return 3 + x; });

  }
);
