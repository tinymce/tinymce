import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene, Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

import * as Look from 'ephox/robin/api/general/Look';
import * as Parent from 'ephox/robin/api/general/Parent';
import * as Structure from 'ephox/robin/api/general/Structure';

UnitTest.test('BlockTest', () => {
  const doc = TestUniverse(Gene('root', 'root', [
    Gene('d1', 'div', [
      TextGene('d1_t1', 'List: '),
      Gene('ol1', 'ol', [
        Gene('li1', 'li', [
          TextGene('li1_text', 'Apples')
        ]),
        Gene('li2', 'li', [
          TextGene('li2_text', 'Beans')
        ]),
        Gene('li3', 'li', [
          TextGene('li3_text', 'Carrots')
        ]),
        Gene('li4', 'li', [
          TextGene('li4_text', 'Diced Tomatoes')
        ])
      ]),
      Gene('ol2', 'ol', [
        Gene('li5', 'li', [
          TextGene('li5_text', 'Elephants')
        ])
      ])
    ])
  ]));

  const check = (expected: Optional<string>, ids: string[], look: (universe: Universe<Gene, undefined>, item: Gene) => Optional<Gene>) => {
    const items = Arr.map(ids, (id) => {
      return doc.find(doc.get(), id).getOrDie();
    });
    const actual = Parent.sharedOne(doc, look, items);
    Assert.eq('Checking parent :: Optional', expected.getOr('none'), actual.getOr(Gene('none', 'none')).id);
  };

  check(Optional.some('ol1'), [ 'li2' ], Look.selector(doc, 'ol'));
  check(Optional.some('ol1'), [ 'li2', 'li3', 'li4_text' ], Look.selector(doc, 'ol'));
  check(Optional.none(), [ 'li2', 'li5' ], Look.selector(doc, 'ol'));

  check(Optional.some('ol1'), [ 'li2', 'li4' ], Look.predicate(doc, (item: Gene) => Structure.isBlock(doc, item)));
  check(Optional.some('d1'), [ 'li1_text', 'li5_text' ], Look.exact(doc, Gene('d1', 'div')));
});
