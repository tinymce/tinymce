test(
  'TextZonesTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.api.general.TextZones',
    'ephox.robin.test.Arbitraries',
    'ephox.robin.test.PropertyAssertions',
    'ephox.robin.test.ZoneObjects',
    'ephox.wrap.Jsc'
  ],

  function (Gene, TestUniverse, TextGene, TextZones, Arbitraries, PropertyAssertions, ZoneObjects, Jsc) {
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
          TextGene('en-g', 'er')
        ], { }, { lang: 'en' })
      ], {}, { lang: 'fr' })
    ]));

    // PropertyAssertions.check('Check text ranges', [
    //   Arbitraries.arbRangeIds(doc1, doc1.property().isText)
    // ], function (info) {
    //   var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    //   var item2 = doc1.find(doc1.get(), info.finishId).getOrDie();
    //   var actual = TextZones.range(doc1, item1, 0, item2, 0);
    //   ZoneObjects.assertProps('Testing zones for ' + info.startId + '->' + info.finishId, doc1, actual.zones());
    //   return true;
    // }, {

    // });

    PropertyAssertions.check('Check boundaries', [
      Arbitraries.arbIds(doc1, doc1.property().isBoundary)
    ], function (info) {
      var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
      var actual = TextZones.range(doc1, item1, 0, item1, 0);
      ZoneObjects.assertProps('Testing zones for ' + info.startId, doc1, actual.zones());
      return true;
    }, {

    });

    PropertyAssertions.check('Check that empty tags produce no zones', [
      Arbitraries.arbIds(doc1, doc1.property().isEmptyTag)
    ], function (info) {
      var item = doc1.find(doc1.get(), info.startId).getOrDie();
      var actual = TextZones.range(doc1, item, 0, item, 0);
      console.log(actual.zones());
      console.log('item', item);
      return Jsc.eq(0, actual.zones().length);
    }, {

    });



    // PropertyAssertions.check('Check inline tags', [
    //   Arbitraries.arbIds(doc1, function (item) {
    //     return !(doc1.property().isBoundary(item) || doc1.property().isEmptyTag(item) || doc1.property().isText(item));
    //   })
    // ], function (info) {
    //   var item1 = doc1.find(doc1.get(), info.startId).getOrDie();
    //   var actual = TextZones.range(doc1, item1, 0, item1, 0);
    //   ZoneObjects.assertProps('Testing zones for ' + info.startId, doc1, actual.zones());
    //   return true;
    // }, {

    // });
  }
);