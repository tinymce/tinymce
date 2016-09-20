test(
  'BoundedClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.test.ZoneObjects',
    'ephox.robin.words.BoundedCluster'
  ],

  function (Gene, TestUniverse, TextGene, Arr, ZoneObjects, BoundedCluster) {
    var check = function (universe, expected, id) {
      var item = universe.find(universe.get(), id).getOrDie();
      var actual = BoundedCluster.scour(universe, item, item);
      ZoneObjects.assertZones('Starting from: ' + id, universe, expected, actual.zones());
    };

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
            ], {}, { lang: 'en' })
          ], {}, { lang: 'de' }),
          TextGene('en-f', 'anoth'),
          TextGene('en-g', 'er')
        ])
      ], {}, { lang: 'en' })
    ]));

    check(doc1, {
      words: [ 'one', 'two', 'one', 'two', 'die', 'but', 'another' ],
      elements: [ 'div1' ]
    }, 'div1');

    var doc2 = TestUniverse(Gene('root', 'root', [
      Gene('div1', 'div', [
        Gene('p1', 'p', [
          TextGene('en-a', 'one'),
          Gene('image2', 'img', [ ]),
          TextGene('en-b', 'tw'),
          TextGene('en-c', 'o'),
          Gene('de', 'span', [
            Gene('span-inline', 'span', [
              TextGene('de-a', 'di'),
              TextGene('de-b', 'e')
            ]),
            Gene('fr', 'span', [
              TextGene('fr-a', 'e')
            ], { }, { lang: 'fr' }),

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
            ], {}, { lang: 'en' })
          ], {}, { lang: 'de' }),
          TextGene('en-f', 'anoth'),
          TextGene('en-g', 'er')
        ])
      ], {}, { lang: 'en' })
    ]));

    check(doc2, {
      words: [ 'one', 'two', 'die', 'e', 'undinside', 'butter', 'another' ],
      items: [ 'div1' ]
    }, 'div1');
  }
);