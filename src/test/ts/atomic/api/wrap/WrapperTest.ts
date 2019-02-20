import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, Logger, TestUniverse, TextGene } from '@ephox/boss';
import * as Wrapping from 'ephox/phoenix/api/general/Wrapping';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('WrapperTest', function () {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('a', '', [
        Gene('aa', '', [
          TextGene('aaa', 'once upon a time'),
          Gene('aab', '', [
            Gene('aaba', '', [
              Gene('aabaa', 'img', []),
              TextGene('aabab', ' there was a dragon')
            ])
          ])
        ]),
        Gene('ab', '', [
          TextGene('aba', ' called '),
          TextGene('abb', ' not-dragon, '),
          Gene('abc', '', [
            Gene('abca', 'br', []),
            TextGene('abcb', 'and that dragon'),
            TextGene('abcc', 'stayed in a far away land'),
            Gene('abcd', '', [
              TextGene('abcda', 'free of contaminants')
            ])
          ])
        ]),
        Gene('ac', '', [
          TextGene('aca', ' --- OCD he was, ')
        ])
      ]),
      TextGene('b', 'yes')
    ])
  );

  let counter = 0;
  const factory = function () {
    const item = Gene('wrap_' + counter, '.');
    counter++;
    return Wrapping.nu(doc, item);
  };

  const dump = function () {
    return Logger.custom(doc.get(), function (item) {
      return doc.property().isText(item) ? item.id + '("' + item.text + '")' : item.id;
    });
  };

  interface ExpResult {
    beginId: string;
    beginOffset: number;
    endId: string;
    endOffset: number
  }

  const check = function (overall: string, expResult: ExpResult, startId: string, startOffset: number, endId: string, endOffset: number) {
    counter = 0;
    const actual = Wrapping.leaves(doc, Finder.get(doc, startId), startOffset, Finder.get(doc, endId), endOffset, factory).getOrDie();
    assert.eq(overall, dump());
    assert.eq(expResult.beginId, actual.begin().element().id);
    assert.eq(expResult.beginOffset, actual.begin().offset());
    assert.eq(expResult.endId, actual.end().element().id);
    assert.eq(expResult.endOffset, actual.end().offset());
  };

  // Let's just do stuff.
  check(
    'root(' +
    'a(' +
    'aa(' +
    'aaa("once upon a time"),' +
    'aab(' +
    'aaba(' +
    'aabaa,' +
    'wrap_0(aabab(" there was a dragon"))' +
    ')' +
    ')' +
    '),' +
    'ab(' +
    'wrap_1(aba(" called ")),' +
    'wrap_2(abb(" not-dragon, ")),' +
    'abc(' +
    'abca,' +
    'wrap_3(abcb("and that dragon")),' +
    'wrap_4(abcc("stayed in a far away land")),' +
    'abcd(' +
    'wrap_5(abcda("free of contaminants"))' +
    ')' +
    ')' +
    '),' +
    'ac(' +
    'wrap_6(aca(" ---")),' +
    '?_ OCD he was, (" OCD he was, ")' +
    ')' +
    '),' +
    'b("yes")' +
    ')', { beginId: 'wrap_0', beginOffset: 0, endId: 'wrap_6', endOffset: 1 }, 'aa', 1, 'aca', 4);
});

