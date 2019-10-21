import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Option } from '@ephox/katamari';
import { WordScope } from 'ephox/robin/data/WordScope';
import Identify from 'ephox/robin/words/Identify';

UnitTest.test('words :: Identify', function () {
  const none = Option.none<string>();
  const some = Option.some;

  const check = function (expected: WordScope[], input: string) {
    const actual = Identify.words(input);
    assert.eq(expected.length, actual.length);
    Arr.map(expected, function (x, i) {
      assert.eq(expected[i].word(), actual[i].word());
      assert.eq(true, expected[i].left().equals(actual[i].left()));
      assert.eq(true, expected[i].right().equals(actual[i].right()));
    });
  };

  const checkWords = function (expected: string[], input: string) {
    const actual = Identify.words(input);
    assert.eq(expected, Arr.map(actual, function (a) { return a.word(); }));
  };

  check([], '');
  check([], ' ');
  check([WordScope('one', none, none)], 'one');
  check([WordScope('this', some('('), some(')'))], '(this)');
  check([WordScope('don\'t', some(' '), some(' '))], ' don\'t ');
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
    WordScope('\'twas', some(' '), some(' ')),
    WordScope('the', some(' '), some(' ')),
    WordScope('night', some(' '), some(' ')),
    WordScope('before', some(' '), none)
  ], ' \'twas the night before');

  check([
    WordScope('this', some('\''), some(' ')),
    WordScope('the', some(' '), some(' ')),
    WordScope('night', some(' '), some(' ')),
    WordScope('before', some(' '), none)
  ], ' \'this the night before');

  // Note, the smart quotes.
  checkWords(['Tale', 'is', 'about', 'an', 'adorable', 'mouse', 'with', 'a', 'lute', 'fighting', 'giant', 'crabs', 'Really', 'I’d', 'hope', 'that', 'was', 'enough', 'for', 'you', 'but', 'I\u2019ll', 'throw'], 'Tale is about an adorable mouse with a lute fighting giant crabs. Really I’d hope that was enough for you, but I\u2019ll throw');
});
