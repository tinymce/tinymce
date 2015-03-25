test(
  'words :: Identify',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.data.WordScope',
    'ephox.robin.words.Identify'
  ],

  function (Arr, Option, WordScope, Identify) {
    var none = Option.none();
    var some = Option.some;

    var check = function (expected, input) {
      var actual = Identify.words(input);
      assert.eq(expected.length, actual.length);
      Arr.map(expected, function (x, i) {
        assert.eq(expected[i].word(), actual[i].word());
        assert.eq(true, expected[i].left().equals(actual[i].left()));
        assert.eq(true, expected[i].right().equals(actual[i].right()));
      });
    };

    check([], '');
    check([], ' ');
    check([WordScope('one', none, none)], 'one');
    check([WordScope('this', some('('), some(')'))], '(this)');
    check([WordScope("don't", some(' '), some(' '))], ' don\'t ');
    check([
      WordScope('it', some('"'), some(' ')),
      WordScope('is', some(' '), some(' ')),
      WordScope('a', some(' '), some(' ')),
      WordScope('good', some(' '), some(' ')),
      WordScope('day', some(' '), some(' ')),
      WordScope('to', some(' '), some(' ')),
      WordScope('live', some(' '), some('"'))
      ], '"it is a good day to live"');
    check([
      WordScope("'twas", some(' '), some(' ')),
      WordScope('the', some(' '), some(' ')),
      WordScope('night', some(' '), some(' ')),
      WordScope('before', some(' '), none)
      ], ' \'twas the night before');

    check([
      WordScope("this", some("'"), some(' ')),
      WordScope('the', some(' '), some(' ')),
      WordScope('night', some(' '), some(' ')),
      WordScope('before', some(' '), none)
      ], ' \'this the night before');

  }
);
