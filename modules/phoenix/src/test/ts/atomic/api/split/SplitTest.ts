import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Split from 'ephox/phoenix/api/general/Split';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('api.Split.(split,splitByPair)', function () {
  const generate = function (text: string) {
    const universe = TestUniverse(
      Gene('root', 'root', [
        TextGene('generate_text', text)
      ])
    );

    const item = Finder.get(universe, 'generate_text');
    return { universe, item };
  };

  const isEq = function (opt1: Option<string>, opt2: Option<Gene>) {
    return opt1.fold(function () {
      return opt2.isNone();
    }, function (a) {
      return opt2.exists(function (x) {
        return a === x.text;
      });
    });
  };

  const checkSplit = function (before: Option<string>, after: Option<string>, text: string, position: number) {
    const input = generate(text);
    const actual = Split.split(input.universe, input.item, position);
    assert.eq(true, isEq(before, actual.before()));
    assert.eq(true, isEq(after, actual.after()));
  };

  const checkPair = function (expected: string, middle: string, text: string, start: number, finish: number) {
    const input = generate(text);
    const actual = Split.splitByPair(input.universe, input.item, start, finish);
    assert.eq(middle, actual.text);
    assert.eq(expected, input.universe.shortlog(function (item) {
      return item.name === 'TEXT_GENE' ? 'text("' + item.text + '")' : item.id;
    }));
  };
  // probably never happens, but just in case
  checkSplit(Option.none(), Option.some('apple'), 'apple', -1);

  checkSplit(Option.some('a '), Option.some('cat'), 'a cat', 2);
  checkSplit(Option.none(), Option.some('apple'), 'apple', 0);
  checkSplit(Option.some('car'), Option.some('t'), 'cart', 3);
  checkSplit(Option.some('cart'), Option.none(), 'cart', 4);
  checkSplit(Option.some('cart'), Option.none(), 'cart', 5);

  checkPair('root(text("apples"))', 'apples', 'apples', 0, 0);
  checkPair('root(text("apples"))', 'apples', 'apples', 0, 6);
  checkPair('root(text("a"),text("pples"))', 'a', 'apples', 1, 0);
  checkPair('root(text("apple"),text("s"))', 'apple', 'apples', 0, 5);
  checkPair('root(text("a"),text("ppl"),text("es"))', 'ppl', 'apples', 1, 4);
  checkPair('root(text("app"),text("les"))', 'les', 'apples', 3, 6);

  checkPair('root(text("app"),text("les"))', 'les', 'apples', 6, 3);
});
