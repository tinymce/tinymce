import { RawAssertions } from '@ephox/agar';
import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { TextGene } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import TextZone from 'ephox/robin/api/general/TextZone';
import Arbitraries from 'ephox/robin/test/Arbitraries';
import PropertyAssertions from 'ephox/robin/test/PropertyAssertions';
import ZoneObjects from 'ephox/robin/test/ZoneObjects';
import { JSON as Json } from '@ephox/sand';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('TextZoneTest', function() {
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
        Gene('span-empty', 'span', [ ]),
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
        Gene('span-isolated', 'span', [ ]),
        TextGene('en-i', ' cat'),

        TextGene('en-j', 'before o'),
        Gene('span-semi-isolated', 'span', [ ]),
        TextGene('en-k', 'n after')
      ], { }, { lang: 'en' })
    ], {}, { lang: 'fr' })
  ]));

  var checkZone = function (label, expected, actual) {
    expected.fold(function () {
      actual.fold(function () {
        // Good
      }, function (act) {
        assert.fail(label + '\nShould not have created zone: ' + Json.stringify(
          Json.stringify(ZoneObjects.rawOne(doc1, act))
        ));
      });
    }, function (exp) {
      actual.fold(function () {
        assert.fail(label + '\nDid not find a zone. Expected to find: ' + Json.stringify(exp, null, 2));
      }, function (act) {
        RawAssertions.assertEq(label + '\nTesting zone: ', exp, ZoneObjects.rawOne(doc1, act));
      });
    });
  };

  var checkSingle = function (label, expected, startId, onlyLang) {
    var item = doc1.find(doc1.get(), startId).getOrDie();
    var actual = TextZone.single(doc1, item, 'en', onlyLang);
    checkZone(label + ' ' + startId, expected, actual);
  };

  var checkRange = function (label, expected, startId, finishId, onlyLang) {
    var item1 = doc1.find(doc1.get(), startId).getOrDie();
    var item2 = doc1.find(doc1.get(), finishId).getOrDie();
    var actual = TextZone.range(doc1, item1, 0, item2, 0, 'en', onlyLang);
    checkZone(label + ' ' + startId + '->' + finishId, expected, actual);
  };

  checkSingle(
    'Basic zone for one text field',
    Option.some({
      lang: 'en',
      words: [ 'one' ],
      elements: [ 'en-a' ]
    }),
    'en-a',
    'en'
  );

  checkSingle(
    'Basic zone for isolated span should be none because no text nodes inside',
    Option.none(),
    'span-isolated',
    'en'
  );

  checkSingle(
    'Basic zone for semi isolated span should have the partial words outside it',
    Option.some({
      lang: 'en',
      words: [ 'on' ],
      elements: [ 'en-j', 'en-k' ]
    }),
    'span-semi-isolated',
    'en'
  );

  checkRange(
    'Basic ranged zone for two adjacent english text nodes should create zone with them',
    Option.some({
      lang: 'en',
      words: [ 'two' ],
      elements: [ 'en-b', 'en-c' ]
    }),
    'en-b', 'en-c',
    'en'
  );

  checkRange(
    'Basic ranged zone for an english text node next to another one (but not part of the range) should create zone with them',
    Option.some({
      lang: 'en',
      words: [ 'two' ],
      elements: [ 'en-b', 'en-c' ]
    }),
    'en-b', 'en-b',
    'en'
  );

  checkRange(
    'Basic ranged zone for an english text node to a german text node should create no zone',
    Option.none(),
    'en-b', 'de-a',
    'en'
  );

  var checkSingleProp = function (info) {
    var item = doc1.find(doc1.get(), info.startId).getOrDie();
    var actual = TextZone.single(doc1, item, 'en', 'en');
    return actual.forall(function (zone) {
      ZoneObjects.assertProps('Testing zone for single(' + info.startId + ')', doc1, [ zone ]);
      return true;
    });
  };

  var checkRangeProp = function (info) {
    var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    var item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    var actual = TextZone.range(doc1, item1, 0, item2, 0, 'en', 'en');
    return actual.forall(function (zone) {
      ZoneObjects.assertProps('Testing zone for range(' + info.startId + '->' + info.finishId + ')', doc1, [ zone ]);
      return true;
    });
  };

  PropertyAssertions.check(
    'Check text single',
    [
      Arbitraries.arbIds(doc1, doc1.property().isText)
    ],
    checkSingleProp,
    { }
  );

  PropertyAssertions.check(
    'Check text range',
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isText)
    ],
    checkRangeProp,
    { }
  );

  PropertyAssertions.check('Check that empty tags produce no zone', [
    Arbitraries.arbIds(doc1, doc1.property().isEmptyTag)
  ], function (info) {
    var item = doc1.find(doc1.get(), info.startId).getOrDie();
    // Consider other offsets
    var actual = TextZone.range(doc1, item, 0, item, 0);
    return Jsc.eq(true, actual.isNone());
  }, {

  });

  PropertyAssertions.check(
    'Check empty range',
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isEmptyTag)
    ],
    checkRangeProp,
    { }
  );

  PropertyAssertions.check(
    'Check boundary single',
    [
      Arbitraries.arbIds(doc1, doc1.property().isBoundary)
    ],
    checkSingleProp,
    { }
  );

  PropertyAssertions.check(
    'Check boundary range',
    [
      Arbitraries.arbRangeIds(doc1, doc1.property().isBoundary)
    ],
    checkRangeProp,
    { }
  );

  PropertyAssertions.check(
    'Check inline tag single',
    [
      Arbitraries.arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkSingleProp,
    { }
  );

  PropertyAssertions.check(
    'Check inline tag range',
    [
      Arbitraries.arbRangeIds(doc1, function (item) {
        return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
      })
    ],
    checkRangeProp,
    { }
  );

  PropertyAssertions.check(
    'Check any tag range',
    [
      Arbitraries.arbRangeIds(doc1, Fun.constant(true))
    ],
    checkRangeProp,
    { }
  );
});

