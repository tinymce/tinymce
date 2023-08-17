import { Assert, it, describe } from '@ephox/bedrock-client';
import { Arr, Unicode } from '@ephox/katamari';

import * as Pattern from 'ephox/polaris/api/Pattern';
import * as Search from 'ephox/polaris/api/Search';
import * as Safe from 'ephox/polaris/pattern/Safe';
import { PRegExp } from 'ephox/polaris/pattern/Types';

describe('atomic.polaris.api.SearchFindTest', () => {
  const checkAll = (expected: [number, number][], input: string, pattern: PRegExp) => {
    const actual = Search.findall(input, pattern);
    Assert.eq(`Checking length of result for "${input}"`, expected.length, actual.length);
    Arr.each(expected, (exp, i) => {
      Assert.eq(`Checking result of start for "${exp}"`, exp[0], actual[i].start);
      Assert.eq(`Checking result of finish for "${exp}"`, exp[1], actual[i].finish);
    });
  };

  const testData = (pattern: PRegExp, name: string) => ({
    pattern,
    name
  });

  const checkMany = (expected: [number, number, string][], text: string, targets: ReturnType<typeof testData>[]) => {
    const actual = Search.findmany(text, targets);
    Assert.eq(`Checking length of result for "${text}"`, expected.length, actual.length);
    Arr.each(expected, (exp, i) => {
      Assert.eq(`Checking result of start for "${exp}"`, exp[0], actual[i].start);
      Assert.eq(`Checking result of finish for "${exp}"`, exp[1], actual[i].finish);
      Assert.eq(`Checking result of name for "${exp}"`, exp[2], actual[i].name);
    });
  };

  it('TINY-10062: checkAll ', () => {
    checkAll([], 'eskimo', Pattern.unsafetoken('hi'));
    checkAll([[ 1, 7 ]], ' cattle', Pattern.unsafetoken('cattle'));
    checkAll([], 'acattle', Pattern.unsafeword('cattle'));
    checkAll([[ 1, 7 ]], ' cattle', Pattern.unsafeword('cattle'));
    checkAll([], Unicode.zeroWidth + 'dog ', Pattern.safeword('dog'));

    checkAll([[ 3, 7 ], [ 10, 14 ]], `no it's i it's done.`, Pattern.unsafetoken(`it's`));
    checkAll([[ 0, 12 ]], `catastrophe'`, Pattern.unsafetoken(`catastrophe'`));

    checkAll([[ 0, 3 ]], 'sre', Pattern.unsafeword('sre'));
    checkAll([[ 0, 3 ]], 'sre ', Pattern.unsafeword('sre'));
    checkAll([[ 1, 4 ]], ' sre', Pattern.unsafeword('sre'));
    checkAll([[ 1, 4 ]], ' sre ', Pattern.unsafeword('sre'));
    checkAll([[ 0, 3 ], [ 4, 7 ]], 'sre sre', Pattern.unsafeword('sre'));
    checkAll([[ 1, 4 ], [ 5, 8 ]], ' sre sre', Pattern.unsafeword('sre'));
    checkAll([[ 1, 4 ], [ 5, 8 ], [ 9, 12 ]], ' sre sre sre', Pattern.unsafeword('sre'));
    checkAll([[ 0, 3 ], [ 4, 7 ], [ 8, 11 ]], 'sre sre sre ', Pattern.unsafeword('sre'));
    checkAll([[ 1, 4 ], [ 5, 8 ], [ 9, 12 ]], ' sre sre sre ', Pattern.unsafeword('sre'));

    checkAll([[ 'this '.length, 'this e'.length + Unicode.zeroWidth.length + 'nds'.length ]], 'this e' + Unicode.zeroWidth + 'nds here', Pattern.unsafeword('e' + Unicode.zeroWidth + 'nds'));

    checkAll([[ 1, 5 ]], ' [wo] and more', Pattern.unsafetoken(Safe.sanitise('[') + '[^' + Safe.sanitise(']') + ']*' + Safe.sanitise(']')));
  });

  it('TINY-10062: checkMany ', () => {
    checkMany([], '', []);
    checkMany([
      [ 1, 3, 'alpha' ]
    ], ' aa bb cc', [
      testData(Pattern.safeword('aa'), 'alpha')
    ]);

    checkMany([
      [ 0, 3, 'alpha' ],
      [ 4, 9, 'beta' ],
      [ 10, 16, 'gamma' ],
      [ 17, 19, 'delta' ],
    ], '<p> Hello World</p>', [
      testData(Pattern.safeword('<p>'), 'alpha'),
      testData(Pattern.safeword('Hello'), 'beta'),
      testData(Pattern.safeword('World<'), 'gamma'),
      testData(Pattern.safeword('p>'), 'delta'),
    ]);

    checkMany([
      [ 0, 8, 'alpha' ],
      [ 9, 15, 'beta' ],
      [ 16, 18, 'gamma' ],
    ], '<p>Hello World</p>', [
      testData(Pattern.safeword('<p>Hello'), 'alpha'),
      testData(Pattern.safeword('World<'), 'beta'),
      testData(Pattern.safeword('p>'), 'gamma'),
    ]);

    checkMany([
      [ 0, 3, 'alpha' ],
      [ 4, 9, 'beta' ],
      [ 10, 15, 'gamma' ],
      [ 16, 17, 'epsilon' ],
      [ 18, 20, 'zeta' ],
    ], '<p> Hello World </p>', [
      testData(Pattern.safeword('<p>'), 'alpha'),
      testData(Pattern.safeword('Hello'), 'beta'),
      testData(Pattern.safeword('World'), 'gamma'),
      testData(Pattern.safeword('<'), 'epsilon'),
      testData(Pattern.safeword('p>'), 'zeta'),
    ]);

    checkMany([
      [ 0, 8, 'alpha' ],
      [ 9, 14, 'beta' ],
      [ 15, 16, 'delta' ],
      [ 17, 19, 'gamma' ],
    ], '<p>Hello World </p>', [
      testData(Pattern.safeword('<p>Hello'), 'alpha'),
      testData(Pattern.safeword('World'), 'beta'),
      testData(Pattern.safeword('<'), 'delta'),
      testData(Pattern.safeword('p>'), 'gamma'),
    ]);

    checkMany([
      [ 7, 16, 'alpha' ],
      [ 25, 27, 'beta' ],
    ], 'Test. [IF:INTEXT]Test2 [/IF]', [
      testData(Pattern.safeword('IF:INTEXT'), 'alpha'),
      testData(Pattern.safeword('IF'), 'beta'),
    ]);

    checkMany([
      [ 8, 10, 'alpha' ],
      [ 18, 27, 'beta' ],
    ], 'Test. [/IF]Test2 [IF:INTEXT]', [
      testData(Pattern.safeword('IF'), 'alpha'),
      testData(Pattern.safeword('IF:INTEXT'), 'beta'),
    ]);

    checkMany([
      [ 0, 2, 'alpha' ],
      [ 3, 6, 'beta' ],
      [ 8, 18, 'gamma' ]
    ], 'aa bbb  abcdefghij', [
      testData(Pattern.safeword('bbb'), 'beta'),
      testData(Pattern.safeword('abcdefghij'), 'gamma'),
      testData(Pattern.safeword('aa'), 'alpha'),
      testData(Pattern.safeword('not-there'), 'delta')
    ]);
  });
});
