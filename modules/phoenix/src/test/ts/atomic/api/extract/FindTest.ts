import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import * as Extract from 'ephox/phoenix/api/general/Extract';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('api.Extract.find', () => {
  const doc = TestUniverse(
    Gene('root', 'root', [
      Gene('1', 'div', [
        Gene('1.1', 'p', [
          Gene('1.1.1', 'img', []),
          TextGene('1.1.2', 'post-image text')
        ]),
        Gene('1.2', 'p', [
          TextGene('1.2.1', 'This is text'),
          Gene('1.2.2', 'span', [
            TextGene('1.2.2.1', 'inside a span')
          ]),
          TextGene('1.2.3', 'More text'),
          Gene('1.2.4', 'em', [
            TextGene('1.2.4.1', 'Inside em')
          ]),
          TextGene('1.2.5', 'Last piece of text')
        ])
      ])
    ])
  );

  const check = (expected: Optional<{ id: string; offset: number }>, topId: string, offset: number) => {
    const top = Finder.get(doc, topId);
    const actual = Extract.find(doc, top, offset);
    expected.fold(() => {
      Assert.eq('Expected none, actual: some', actual.isNone(), true);
    }, (exp) => {
      actual.fold(() => {
        Assert.fail('Expected some, actual: none');
      }, (act) => {
        Assert.eq('', exp.id, act.element.id);
        Assert.eq('', exp.offset, act.offset);
      });
    });
  };

  /* Note, it's hard to know whether something should favour being at the end of the previous or the start of the next */
  check(Optional.some({ id: '1.1.2', offset: 2 }), 'root', 3);
  check(Optional.some({ id: '1.2.4.1', offset: 3 }), '1.2', 'This is textinside a spanMore textIns'.length);
});
