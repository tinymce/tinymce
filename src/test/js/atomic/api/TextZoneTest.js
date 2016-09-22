test(
  'TextZoneTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.TextZone',
    'ephox.robin.test.ZoneObjects'
  ],

  function (RawAssertions, Gene, TestUniverse, TextGene, Json, Option, TextZone, ZoneObjects) {
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
  }
);