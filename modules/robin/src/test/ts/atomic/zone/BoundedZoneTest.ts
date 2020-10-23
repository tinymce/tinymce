import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { ZoneViewports } from 'ephox/robin/api/general/ZoneViewports';
import { ArbRangeIds, arbRangeIds } from 'ephox/robin/test/Arbitraries';
import * as PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import { assertProps, assertZones, RawZone } from 'ephox/robin/test/ZoneObjects';
import * as TextZones from 'ephox/robin/zone/TextZones';

UnitTest.test('BoundedZoneTest', function () {
  const check = function (universe: TestUniverse, expected: RawZone[], id: string) {
    const item = universe.find(universe.get(), id).getOrDie();
    const actual = TextZones.fromBounded(universe, item, item, 'en', ZoneViewports.anything());
    assertZones('Starting from: ' + id, universe, expected, actual.zones);
  };

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
        TextGene('en-g', 'er')
      ], {}, { lang: 'en' })
    ], {}, { lang: 'fr' })
  ]));

  check(doc1, [

    { lang: 'fr', elements: [ 'a' ], words: [ 'one' ] },
    { lang: 'fr', elements: [ 'b', 'c' ], words: [ 'two' ] },

    { lang: 'en', elements: [ 'en-a' ], words: [ 'one' ] },
    { lang: 'en', elements: [ 'en-b', 'en-c' ], words: [ 'two' ] },

    { lang: 'de', elements: [ 'de-a', 'de-b' ], words: [ 'die' ] },

    { lang: 'en', elements: [ 'en-d', 'en-e' ], words: [ 'butter' ] },

    { lang: 'de', elements: [ 'de-c' ], words: [ 'der', 'Hund' ] },

    { lang: 'en', elements: [ 'en-f', 'en-g' ], words: [ 'another' ] }

  ], 'div1');

  const doc2 = TestUniverse(Gene('root', 'root', [
    Gene('div1', 'div', [
      Gene('p1', 'p', [
        TextGene('en-a', 'one'),
        Gene('image2', 'img', []),
        TextGene('en-b', 'tw'),
        TextGene('en-c', 'o'),
        Gene('de', 'span', [
          Gene('span-inline', 'span', [
            TextGene('de-a', 'di'),
            TextGene('de-b', 'e')
          ]),
          Gene('fr', 'span', [
            TextGene('fr-a', 'e')
          ], {}, { lang: 'fr' }),

          // The language should jump back to de.
          TextGene('de-c', 'und'),
          Gene('de2', 'span', [
            TextGene('de-c-1', 'inside')
          ], {}, { lang: 'de' }),
          Gene('en', 'span', [
            TextGene('en-d', 'but')
          ], {}, { lang: 'en' }),
          Gene('en2', 'span', [
            TextGene('en-e', 'ter')
          ], {}, { lang: 'en' }),
          // This text node is put in because of a limitation where we need an intervening text node to identify
          // language boundaries
          TextGene('de-d', '')
        ], {}, { lang: 'de' }),
        TextGene('en-f', 'anoth'),
        TextGene('en-g', 'er')
      ])
    ], {}, { lang: 'en' })
  ]));

  check(doc2, [

    { lang: 'en', elements: [ 'en-a' ], words: [ 'one' ] },
    { lang: 'en', elements: [ 'en-b', 'en-c' ], words: [ 'two' ] },
    { lang: 'de', elements: [ 'de-a', 'de-b' ], words: [ 'die' ] },
    { lang: 'fr', elements: [ 'fr-a' ], words: [ 'e' ] },
    { lang: 'de', elements: [ 'de-c', 'de-c-1' ], words: [ 'undinside' ] },
    { lang: 'en', elements: [ 'en-d', 'en-e' ], words: [ 'butter' ] },
    { lang: 'de', elements: [ 'de-d' ], words: [] },
    { lang: 'en', elements: [ 'en-f', 'en-g' ], words: [ 'another' ] }

  ], 'div1');

  PropertyAssertions.check('Checking any id ranges', [
    arbRangeIds(doc1, doc1.property().isText)
  ], function (info: ArbRangeIds) {
    const item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    const item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    const actual = TextZones.fromBounded(doc1, item1, item2, 'en', ZoneViewports.anything());
    assertProps('Testing zones for ' + info.startId + '->' + info.finishId, doc1, actual.zones);
    return true;
  });
});
