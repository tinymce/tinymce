import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene, Universe } from '@ephox/boss';
import * as Extract from 'ephox/phoenix/api/general/Extract';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('ExtractTextTest', function() {
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
            TextGene('1.2.2.1', 'inside a span'),
            Gene('1.2.2.2', 'br', [])
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

  const check = function (expected: string, extract: <E, D>(universe: Universe<E, D>, item: E) => string, initial: string) {
    const start = Finder.get(doc, initial);
    const actual = extract(doc, start);
    assert.eq(expected, actual.trim());
  };

  check('Inside em', Extract.toText, '1.2.4');
  check('post-image text\n\nThis is textinside a span\nMore textInside emLast piece of text', Extract.toText, '1');
});

