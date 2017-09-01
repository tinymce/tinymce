test(
    'ArrHeadTest',
  
    [
        'ephox.katamari.api.Arr'
    ],
    function(Arr) {
      var checkNone = function (xs) {
        var actual = Arr.head(xs);
        assert.eq(true, actual.isNone());
      };
  
      var check = function (expected, xs) {
        var actual = Arr.head(xs).getOrDie('should have value');
        assert.eq(expected, actual);
      };
  
      checkNone([]);
      check(1, [1]);
      check(1, [1, 2]);
      check('dog', ['dog', 3]);
      check('dog', ['dog', 3, 'cat']);
    }
  );