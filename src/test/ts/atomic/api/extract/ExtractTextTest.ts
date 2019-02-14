import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import * as Extract from 'ephox/phoenix/api/general/Extract';
import * as Finder from 'ephox/phoenix/test/Finder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ExtractTextTest', function() {
  var doc = TestUniverse(
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

  var check = function (expected, extract, initial) {
    var start = Finder.get(doc, initial);
    var actual = extract(doc, start);
    assert.eq(expected, actual.trim());
  };

  check('Inside em', Extract.toText, '1.2.4');
  check('post-image text\n\nThis is textinside a span\nMore textInside emLast piece of text', Extract.toText, '1');
});

