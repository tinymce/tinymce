import { Logger } from '@ephox/agar';
import { RawAssertions } from '@ephox/agar';
import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import TextZones from 'ephox/robin/api/general/TextZones';
import ZoneViewports from 'ephox/robin/api/general/ZoneViewports';
import Arbitraries from 'ephox/robin/test/Arbitraries';
import PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import ZoneObjects from 'ephox/robin/test/ZoneObjects';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.test('TextZonesTest', function() {
  var doc1 = TestUniverse(Gene('root', 'root', [
    Gene('div1', 'div', [
      Gene('p1', 'p', [
        TextGene('a', 'one'),
        Gene('image', 'img', [ ]),
        TextGene('b', 'tw'),
        TextGene('c', 'o')
      ]),
      Gene('p2', 'p', [
        TextGene('en-a', 'one'),
        Gene('image2', 'img', [ ]),
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
        TextGene('en-k', ' isolated-text' ),
        TextGene('ek-l' ,' ')
      ], { }, { lang: 'en' })
    ], {}, { lang: 'fr' })
  ]));

  var checkSingle = function (info) {
    var item = doc1.find(doc1.get(), info.startId).getOrDie();
    var actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
    ZoneObjects.assertProps('Testing zones for single(' + info.startId + ')', doc1, actual.zones());
    return true;
  };

  var checkRange = function (info) {
    var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    var item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    var actual = TextZones.range(doc1, item1, 0, item2, 0, 'en', ZoneViewports.anything());
    ZoneObjects.assertProps('Testing zones for range(' + info.startId + '->' + info.finishId + ')', doc1, actual.zones());
    return true;
  };

  Logger.sync(
    'Checking the (single) zone of an isolated inline tag',
    function () {
      var item = doc1.find(doc1.get(), 'isolated').getOrDie();
      var actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
      RawAssertions.assertEq(
        'Zone assertion',
        [{
          lang: 'en',
          elements: [
            'en-i'
          ],
          words: [
            'isolated'
          ]
        }], ZoneObjects.raw(doc1, actual.zones()));
    }
  );

  Logger.sync(
    'Checking the (single) zone of an isolated text node',
    function () {
      var item = doc1.find(doc1.get(), 'en-k').getOrDie();
      var actual = TextZones.single(doc1, item, 'en', ZoneViewports.anything());
      RawAssertions.assertEq(
        'Zone assertion',
        [{
          lang: 'en',
          elements: [
            'en-k'
          ],
          words: [
            'isolated-text'
          ]
        }], ZoneObjects.raw(doc1, actual.zones()));
    }
  );

  PropertyAssertions.check(
    'Check text single', 
    [
      Arbitraries.arbIds(doc1, doc1.property().isText)
    ],
    checkSingle,
    { }
  );

  PropertyAssertions.check(
    'Check text range', 
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isText)
    ],
    checkRange,
    { }
  );

  PropertyAssertions.check('Check that empty tags produce no zones', [
    Arbitraries.arbIds(doc1, doc1.property().isEmptyTag)
  ], function (info) {
    var item = doc1.find(doc1.get(), info.startId).getOrDie();
    // Consider other offsets
    var actual = TextZones.range(doc1, item, 0, item, 0, 'en', ZoneViewports.anything());
    return Jsc.eq(0, actual.zones().length);
  }, {

  });

  PropertyAssertions.check(
    'Check empty range', 
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isEmptyTag)
    ],
    checkRange,
    { }
  );

  PropertyAssertions.check(
    'Check boundary single', 
    [
      Arbitraries.arbIds(doc1, doc1.property().isBoundary)
    ],
    checkSingle,
    { }
  );

  PropertyAssertions.check(
    'Check boundary range', 
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isBoundary)
    ],
    checkRange,
    { }
  );

  PropertyAssertions.check(
    'Check inline tag single', 
    [
      Arbitraries.arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkSingle,
    { }
  );

  PropertyAssertions.check(
    'Check inline tag range', 
    [
      Arbitraries.arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkRange,
    { }
  );

  PropertyAssertions.check(
    'Check any tag range', 
    [
      Arbitraries.arbRangeIds(doc1, Fun.constant(true))
    ],
    checkRange,
    { }
  );
});

