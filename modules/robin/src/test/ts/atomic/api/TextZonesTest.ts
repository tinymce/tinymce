import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import * as TextZones from 'ephox/robin/api/general/TextZones';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import { ArbIds, arbIds, ArbRangeIds, arbRangeIds } from 'ephox/robin/test/Arbitraries';
import * as PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import { assertProps, raw } from 'ephox/robin/test/ZoneObjects';

UnitTest.test('TextZonesTest', function () {
  const doc1 = TestUniverse(Gene('root', 'root', [
    Gene('div1', 'div', [
      Gene('p1', 'p', [
        TextGene('a', 'one'),
        Gene('image', 'img', []),
        TextGene('b', 'tw'),
        TextGene('c', 'o')
      ]),
      Gene('p2', 'p', [
        TextGene('en-a', 'one'),
        Gene('image2', 'img', []),
        TextGene('en-b', 'tw'),
        TextGene('en-c', 'o'),
        Gene('de', 'span', [
          TextGene('de-a', 'di'),
          TextGene('de-b', 'e'),

          // Two consecutive english spans, so all should be in the same section.
          Gene('en', 'span', [
            TextGene('en-d', 'but')
          ], {}, { lang: 'en' }),
          Gene('en2', 'span', [
            TextGene('en-e', 'ter')
          ], {}, { lang: 'en' }),
          TextGene('de-c', 'der Hund')
        ], {}, { lang: 'de' }),
        TextGene('en-f', 'anoth'),
        TextGene('en-g', 'er'),
        TextGene('en-h', ' '),
        Gene('isolated', 'span', [
          TextGene('en-i', 'isolated')
        ]),
        TextGene('en-j', ' '),
        TextGene('en-k', ' isolated-text'),
        TextGene('ek-l', ' ')
      ], {}, { lang: 'en' })
    ], {}, { lang: 'fr' })
  ]));

  const checkSingle = function (info: ArbIds) {
    const item = doc1.find(doc1.get(), info.startId).getOrDie();
    const actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
    assertProps('Testing zones for single(' + info.startId + ')', doc1, actual.zones);
    return true;
  };

  const checkRange = function (info: ArbRangeIds) {
    const item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    const item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    const actual = TextZones.range(doc1, item1, 0, item2, 0, 'en', ZoneViewports.anything());
    assertProps('Testing zones for range(' + info.startId + '->' + info.finishId + ')', doc1, actual.zones);
    return true;
  };

  Logger.sync(
    'Checking the (single) zone of an isolated inline tag',
    function () {
      const item = doc1.find(doc1.get(), 'isolated').getOrDie();
      const actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
      Assert.eq(
        'Zone assertion',
        [{
          lang: 'en',
          elements: [
            'en-i'
          ],
          words: [
            'isolated'
          ]
        }], raw(doc1, actual.zones));
    }
  );

  Logger.sync(
    'Checking the (single) zone of an isolated text node',
    function () {
      const item = doc1.find(doc1.get(), 'en-k').getOrDie();
      const actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
      Assert.eq(
        'Zone assertion',
        [{
          lang: 'en',
          elements: [
            'en-k'
          ],
          words: [
            'isolated-text'
          ]
        }], raw(doc1, actual.zones));
    }
  );

  PropertyAssertions.check(
    'Check text single',
    [
      arbIds(doc1, doc1.property().isText)
    ],
    checkSingle
  );

  PropertyAssertions.check(
    'Check text range',
    [
      arbRangeIds(doc1, doc1.property().isText)
    ],
    checkRange
  );

  PropertyAssertions.check('Check that empty tags produce no zones', [
    arbIds(doc1, doc1.property().isEmptyTag)
  ], function (info: ArbIds) {
    const item = doc1.find(doc1.get(), info.startId).getOrDie();
    // Consider other offsets
    const actual = TextZones.range(doc1, item, 0, item, 0, 'en', ZoneViewports.anything());
    return Jsc.eq(0, actual.zones.length);
  });

  PropertyAssertions.check(
    'Check empty range',
    [
      arbRangeIds(doc1, doc1.property().isEmptyTag)
    ],
    checkRange
  );

  PropertyAssertions.check(
    'Check boundary single',
    [
      arbIds(doc1, doc1.property().isBoundary)
    ],
    checkSingle
  );

  PropertyAssertions.check(
    'Check boundary range',
    [
      arbRangeIds(doc1, doc1.property().isBoundary)
    ],
    checkRange
  );

  PropertyAssertions.check(
    'Check inline tag single',
    [
      arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkSingle
  );

  PropertyAssertions.check(
    'Check inline tag range',
    [
      arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkRange
  );

  PropertyAssertions.check(
    'Check any tag range',
    [
      arbRangeIds(doc1, Fun.constant(true))
    ],
    checkRange
  );
});
