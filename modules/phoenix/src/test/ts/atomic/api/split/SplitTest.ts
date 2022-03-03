import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import * as Split from 'ephox/phoenix/api/general/Split';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('api.Split.(split,splitByPair)', () => {
  const generate = (text: string) => {
    const universe = TestUniverse(
      Gene('root', 'root', [
        TextGene('generate_text', text)
      ])
    );

    const item = Finder.get(universe, 'generate_text');
    return { universe, item };
  };

  const isEq = (opt1: Optional<string>, opt2: Optional<Gene>) => {
    return opt1.fold(() => {
      return opt2.isNone();
    }, (a) => {
      return opt2.exists((x) => {
        return a === x.text;
      });
    });
  };

  const checkSplit = (before: Optional<string>, after: Optional<string>, text: string, position: number) => {
    const input = generate(text);
    const actual = Split.split(input.universe, input.item, position);
    Assert.eq('', true, isEq(before, actual.before));
    Assert.eq('', true, isEq(after, actual.after));
  };

  const checkPair = (expected: string, middle: string, text: string, start: number, finish: number) => {
    const input = generate(text);
    const actual = Split.splitByPair(input.universe, input.item, start, finish);
    Assert.eq('', middle, actual.text);
    Assert.eq('', expected, input.universe.shortlog((item) => {
      const props = input.universe.property();
      return props.isText(item) ? `text("${props.getText(item)}")` : item.id;
    }));
  };
  // probably never happens, but just in case
  checkSplit(Optional.none(), Optional.some('apple'), 'apple', -1);

  checkSplit(Optional.some('a '), Optional.some('cat'), 'a cat', 2);
  checkSplit(Optional.none(), Optional.some('apple'), 'apple', 0);
  checkSplit(Optional.some('car'), Optional.some('t'), 'cart', 3);
  checkSplit(Optional.some('cart'), Optional.none(), 'cart', 4);
  checkSplit(Optional.some('cart'), Optional.none(), 'cart', 5);

  checkPair('root(text("apples"))', 'apples', 'apples', 0, 0);
  checkPair('root(text("apples"))', 'apples', 'apples', 0, 6);
  checkPair('root(text("a"),text("pples"))', 'a', 'apples', 1, 0);
  checkPair('root(text("apple"),text("s"))', 'apple', 'apples', 0, 5);
  checkPair('root(text("a"),text("ppl"),text("es"))', 'ppl', 'apples', 1, 4);
  checkPair('root(text("app"),text("les"))', 'les', 'apples', 3, 6);

  checkPair('root(text("app"),text("les"))', 'les', 'apples', 6, 3);
});
