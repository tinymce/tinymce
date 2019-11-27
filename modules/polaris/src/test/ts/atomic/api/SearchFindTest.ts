import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Struct, Unicode } from '@ephox/katamari';
import * as Pattern from 'ephox/polaris/api/Pattern';
import * as Search from 'ephox/polaris/api/Search';
import * as Safe from 'ephox/polaris/pattern/Safe';
import { PRegExp } from 'ephox/polaris/pattern/Types';

UnitTest.test('api.Search.findall (using api.Pattern)', function () {
  const checkAll = function (expected: [number, number][], input: string, pattern: PRegExp) {
    const actual = Search.findall(input, pattern);
    assert.eq(expected.length, actual.length);
    Arr.each(expected, function (exp, i) {
      assert.eq(exp[0], actual[i].start());
      assert.eq(exp[1], actual[i].finish());
    });
  };
  const testData: (pattern: PRegExp, name: string) => { pattern: () => PRegExp, name: () => string } = Struct.immutable('pattern', 'name');

  const checkMany = function (expected: [number, number, string][], text: string, targets: ReturnType<typeof testData>[]) {
    const actual = Search.findmany(text, targets);
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
  checkAll([], Unicode.zeroWidth + 'dog ', Pattern.safeword('dog'));

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

  checkAll([['this '.length, 'this e'.length + Unicode.zeroWidth.length + 'nds'.length]], 'this e' + Unicode.zeroWidth + 'nds here', Pattern.unsafeword('e' + Unicode.zeroWidth + 'nds'));

  const prefix = Safe.sanitise('[');
  const suffix = Safe.sanitise(']');
  checkAll([[1, 5]], ' [wo] and more', Pattern.unsafetoken(prefix + '[^' + suffix + ']*' + suffix));

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
