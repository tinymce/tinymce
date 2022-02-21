import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Fun, Optional } from '@ephox/katamari';

import * as TextZone from 'ephox/robin/api/general/TextZone';
import { ArbIds, arbIds, ArbRangeIds, arbRangeIds } from 'ephox/robin/test/Arbitraries';
import * as PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import { assertProps, rawOne, RawZone } from 'ephox/robin/test/ZoneObjects';
import { Zone } from 'ephox/robin/zone/Zones';

UnitTest.test('TextZoneTest', () => {
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
        Gene('span-empty', 'span', []),
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
        Gene('span-isolated', 'span', []),
        TextGene('en-i', ' cat'),

        TextGene('en-j', 'before o'),
        Gene('span-semi-isolated', 'span', []),
        TextGene('en-k', 'n after')
      ], {}, { lang: 'en' })
    ], {}, { lang: 'fr' })
  ]));

  const checkZone = (label: string, expected: Optional<RawZone>, actual: Optional<Zone<Gene>>) => {
    expected.fold(() => {
      actual.fold(
        // Good
        Fun.noop,
        (act) => {
          Assert.fail(label + '\nShould not have created zone: ' + JSON.stringify(
            JSON.stringify(rawOne(doc1, act))
          ));
        }
      );
    }, (exp) => {
      actual.fold(() => {
        Assert.fail(label + '\nDid not find a zone. Expected to find: ' + JSON.stringify(exp, null, 2));
      }, (act) => {
        Assert.eq(label + '\nTesting zone: ', exp, rawOne(doc1, act));
      });
    });
  };

  const checkSingle = (label: string, expected: Optional<RawZone>, startId: string, onlyLang: string) => {
    const item = doc1.find(doc1.get(), startId).getOrDie();
    const actual = TextZone.single(doc1, item, 'en', onlyLang);
    checkZone(label + ' ' + startId, expected, actual);
  };

  const checkRange = (label: string, expected: Optional<RawZone>, startId: string, finishId: string, onlyLang: string) => {
    const item1 = doc1.find(doc1.get(), startId).getOrDie();
    const item2 = doc1.find(doc1.get(), finishId).getOrDie();
    const actual = TextZone.range(doc1, item1, 0, item2, 0, 'en', onlyLang);
    checkZone(label + ' ' + startId + '->' + finishId, expected, actual);
  };

  checkSingle(
    'Basic zone for one text field',
    Optional.some({
      lang: 'en',
      words: [ 'one' ],
      elements: [ 'en-a' ]
    }),
    'en-a',
    'en'
  );

  checkSingle(
    'Basic zone for isolated span should be none because no text nodes inside',
    Optional.none(),
    'span-isolated',
    'en'
  );

  checkSingle(
    'Basic zone for semi isolated span should have the partial words outside it',
    Optional.some({
      lang: 'en',
      words: [ 'on' ],
      elements: [ 'en-j', 'en-k' ]
    }),
    'span-semi-isolated',
    'en'
  );

  checkRange(
    'Basic ranged zone for two adjacent english text nodes should create zone with them',
    Optional.some({
      lang: 'en',
      words: [ 'two' ],
      elements: [ 'en-b', 'en-c' ]
    }),
    'en-b', 'en-c',
    'en'
  );

  checkRange(
    'Basic ranged zone for an english text node next to another one (but not part of the range) should create zone with them',
    Optional.some({
      lang: 'en',
      words: [ 'two' ],
      elements: [ 'en-b', 'en-c' ]
    }),
    'en-b', 'en-b',
    'en'
  );

  checkRange(
    'Basic ranged zone for an english text node to a german text node should create no zone',
    Optional.none(),
    'en-b', 'de-a',
    'en'
  );

  const checkSingleProp = (info: ArbIds) => {
    const item = doc1.find(doc1.get(), info.startId).getOrDie();
    const actual = TextZone.single(doc1, item, 'en', 'en');
    return actual.forall((zone) => {
      assertProps('Testing zone for single(' + info.startId + ')', doc1, [ zone ]);
      return true;
    });
  };

  const checkRangeProp = (info: ArbRangeIds) => {
    const item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    const item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    const actual = TextZone.range(doc1, item1, 0, item2, 0, 'en', 'en');
    return actual.forall((zone) => {
      assertProps('Testing zone for range(' + info.startId + '->' + info.finishId + ')', doc1, [ zone ]);
      return true;
    });
  };

  PropertyAssertions.check(
    'Check text single',
    arbIds(doc1, doc1.property().isText),
    checkSingleProp
  );

  PropertyAssertions.check(
    'Check text range',
    arbRangeIds(doc1, doc1.property().isText),
    checkRangeProp
  );

  PropertyAssertions.check('Check that empty tags produce no zone', arbIds(doc1, doc1.property().isEmptyTag), (info) => {
    const item = doc1.find(doc1.get(), info.startId).getOrDie();
    // Consider other offsets
    const actual = TextZone.range(doc1, item, 0, item, 0, 'en', 'en');
    return actual.isNone();
  });

  PropertyAssertions.check(
    'Check empty range',
    arbRangeIds(doc1, doc1.property().isEmptyTag),
    checkRangeProp
  );

  PropertyAssertions.check(
    'Check boundary single',
    arbIds(doc1, doc1.property().isBoundary),
    checkSingleProp
  );

  PropertyAssertions.check(
    'Check boundary range',
    arbRangeIds(doc1, doc1.property().isBoundary),
    checkRangeProp
  );

  PropertyAssertions.check(
    'Check inline tag single',
    arbRangeIds(doc1, (item: Gene) => {
      return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
    }),
    checkSingleProp
  );

  PropertyAssertions.check(
    'Check inline tag range',
    arbRangeIds(doc1, (item: Gene) => {
      return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
    }),
    checkRangeProp
  );

  PropertyAssertions.check(
    'Check any tag range',
    arbRangeIds(doc1, Fun.always),
    checkRangeProp
  );
});
