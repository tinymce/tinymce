import { Assert, describe, it } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Fun } from '@ephox/katamari';

import * as TextZones from 'ephox/robin/api/general/TextZones';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import { ArbIds, arbIds, ArbRangeIds, arbRangeIds } from 'ephox/robin/test/Arbitraries';
import * as PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import { assertProps, raw } from 'ephox/robin/test/ZoneObjects';

describe('atomic.robin.zone.TextZonesTest', () => {
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

  const checkSingle = (info: ArbIds) => {
    const item = doc1.find(doc1.get(), info.startId).getOrDie();
    const actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
    assertProps('Testing zones for single(' + info.startId + ')', doc1, actual.zones);
    return true;
  };

  const checkRange = (info: ArbRangeIds) => {
    const item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    const item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    const actual = TextZones.range(doc1, item1, 0, item2, 0, 'en', ZoneViewports.anything());
    assertProps('Testing zones for range(' + info.startId + '->' + info.finishId + ')', doc1, actual.zones);
    return true;
  };

  it('Checking the (single) zone of an isolated inline tag', () => {
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
  });

  it('Checking the (single) zone of an isolated text node', () => {
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
  });

  it('Check text single', () => {
    PropertyAssertions.check(
      arbIds(doc1, doc1.property().isText),
      checkSingle
    );
  });

  it('Check text range', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, doc1.property().isText),
      checkRange
    );
  });

  it('Check that empty tags produce no zones', () => {
    PropertyAssertions.check(arbIds(doc1, doc1.property().isEmptyTag), (info) => {
      const item = doc1.find(doc1.get(), info.startId).getOrDie();
      // Consider other offsets
      const actual = TextZones.range(doc1, item, 0, item, 0, 'en', ZoneViewports.anything());
      return actual.zones.length === 0;
    });
  });

  it('Check empty range', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, doc1.property().isEmptyTag),
      checkRange
    );
  });

  it('Check boundary single', () => {
    PropertyAssertions.check(
      arbIds(doc1, doc1.property().isBoundary),
      checkSingle
    );
  });

  it('Check boundary range', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, doc1.property().isBoundary),
      checkRange
    );
  });

  it('Check inline tag single', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, (item) => {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      }),
      checkSingle
    );
  });

  it('Check inline tag range', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, (item) => {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      }),
      checkRange
    );
  });

  it('Check any tag range', () => {
    PropertyAssertions.check(
      arbRangeIds(doc1, Fun.always),
      checkRange
    );
  });
});
