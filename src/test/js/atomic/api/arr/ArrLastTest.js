test(
    'ArrLastTest',
  
    [
        'ephox.katamari.api.Arr'
    ],
    function(Arr) {
      var checkNone = function (xs) {
        var actual = Arr.last(xs);
        assert.eq(true, actual.isNone());
      };
  
      var check = function (expected, xs) {
        var actual = Arr.last(xs).getOrDie('should have value');
        assert.eq(expected, actual);
      };
  
      checkNone([]);
      check(1, [1]);
      check(2, [1, 2]);
      check('dog', [3, 'dog']);
      check('cat', ['dog', 3, 'cat']);
    }
  );