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

    var checkWords = function (expected, input) {
      var actual = Identify.words(input);
      assert.eq(expected, Arr.map(actual, function (a) { return a.word(); }));
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

    checkWords([ 'Tale', 'is', 'about', 'an', 'adorable', 'mouse', 'with', 'a', 'lute', 'fighting', 'giant', 'crabs', 'Really', 'I’d', 'hope', 'that', 'was', 'enough', 'for', 'you', 'but', 'I\u2019ll', 'throw' ], 'Tale is about an adorable mouse with a lute fighting giant crabs. Really I’d hope that was enough for you, but I\u2019ll throw');
  }
);
// Tale is about an adorable mouse with a lute fighting giant crabs. Really I'd hope that was enough for you, but I’ll throw in some more info as a bonus. It’s set in a medieval fantasy entirely inhabited by animals, explored in third person with inspiration from the likes of Zelda and Ico. There’s a balance struck between the cute central character and a very dark, ruined world with sometimes terrifying enemies. Along with the aforementioned crabs, hero Tilo will find skeletal rats three times his height, hawks, badgers and spear-wielding frogs to contend with.