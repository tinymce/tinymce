import { Unicode } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import Pattern from 'ephox/polaris/api/Pattern';
import Search from 'ephox/polaris/api/Search';
import Safe from 'ephox/polaris/pattern/Safe';
import { Struct } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('api.Search.findall (using api.Pattern)', function() {
  var checkAll = function (expected, input, pattern) {
    var actual = Search.findall(input, pattern);
    assert.eq(expected.length, actual.length);
    Arr.each(expected, function (exp, i) {
      assert.eq(exp[0], actual[i].start());
      assert.eq(exp[1], actual[i].finish());
    });
  };

  var checkMany = function (expected, text, targets) {
    var actual = Search.findmany(text, targets);
    assert.eq(expected.length, actual.length);
    Arr.each(expected, function (exp, i) {
      assert.eq(exp[0], actual[i].start());
      assert.eq(exp[1], actual[i].finish());
      assert.eq(exp[2], actual[i].name());
    });
  };

  checkAll([], 'eskimo', Pattern.unsafetoken('hi'));
  checkAll([[1, 7]], ' cattle', Pattern.unsafetoken('cattle'));
  checkAll([], 'acattle', Pattern.unsafeword('cattle'));
  checkAll([[1, 7]], ' cattle', Pattern.unsafeword('cattle'));
  checkAll([], Unicode.zeroWidth() + 'dog ', Pattern.safeword('dog'));

  checkAll([[3, 7], [10, 14]], 'no it\'s i it\'s done.', Pattern.unsafetoken('it\'s'));
  checkAll([[0, 12]], 'catastrophe\'', Pattern.unsafetoken('catastrophe\''));

  checkAll([[0, 3]], 'sre', Pattern.unsafeword('sre'));
  checkAll([[0, 3]], 'sre ', Pattern.unsafeword('sre'));
  checkAll([[1, 4]], ' sre', Pattern.unsafeword('sre'));
  checkAll([[1, 4]], ' sre ', Pattern.unsafeword('sre'));
  checkAll([[0, 3], [4, 7]], 'sre sre', Pattern.unsafeword('sre'));
  checkAll([[1, 4], [5, 8]], ' sre sre', Pattern.unsafeword('sre'));
  checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre', Pattern.unsafeword('sre'));
  checkAll([[0, 3], [4, 7], [8, 11]], 'sre sre sre ', Pattern.unsafeword('sre'));
  checkAll([[1, 4], [5, 8], [9, 12]], ' sre sre sre ', Pattern.unsafeword('sre'));

  checkAll([['this '.length, 'this e'.length + Unicode.zeroWidth().length + 'nds'.length]], 'this e' + Unicode.zeroWidth() + 'nds here', Pattern.unsafeword('e' + Unicode.zeroWidth() + 'nds'));

  var prefix = Safe.sanitise('[');
  var suffix = Safe.sanitise(']');
  checkAll([[1, 5]], ' [wo] and more', Pattern.unsafetoken(prefix + '[^' + suffix + ']*' + suffix));

  var testData = Struct.immutable('pattern', 'name');
  checkMany([], '', []);
  checkMany([
    [1, 3, 'alpha']
  ], ' aa bb cc', [
    testData(Pattern.safeword('aa'), 'alpha')
  ]);

  checkMany([
    [0, 2, 'alpha'],
    [3, 6, 'beta'],
    [8, 18, 'gamma']
  ], 'aa bbb  abcdefghij', [
    testData(Pattern.safeword('bbb'), 'beta'),
    testData(Pattern.safeword('abcdefghij'), 'gamma'),
    testData(Pattern.safeword('aa'), 'alpha'),
    testData(Pattern.safeword('not-there'), 'delta')
  ]);
});

