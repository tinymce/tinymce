import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Option } from '@ephox/katamari';
import * as Split from 'ephox/phoenix/api/general/Split';
import * as Finder from 'ephox/phoenix/test/Finder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('api.Split.(split,splitByPair)', function() {
  var generate = function (text) {
    var universe = TestUniverse(
      Gene('root', 'root', [
        TextGene('generate_text', text)
      ])
    );

    var item = Finder.get(universe, 'generate_text');
    return {
      universe: universe,
      item: item
    };
  };

  var isEq = function (opt1, opt2) {
    return opt1.fold(function () {
      return opt2.isNone();
    }, function (a) {
      return opt2.exists(function (x) {
        return a === x.text;
      });
    });
  };

  var checkSplit = function (before, after, text, position) {
    var input = generate(text);
    var actual = Split.split(input.universe, input.item, position);
    assert.eq(true, isEq(before, actual.before()));
    assert.eq(true, isEq(after, actual.after()));
  };

  var checkPair = function (expected, middle, text, start, finish) {
    var input = generate(text);
    var actual = Split.splitByPair(input.universe, input.item, start, finish);
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

