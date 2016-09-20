test(
  'BoundedClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.words.BoundedCluster'
  ],

  function (Gene, TestUniverse, TextGene, Arr, BoundedCluster) {
    var doc = TestUniverse(Gene('root', 'root', [
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

    var check = function (expected, id) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = BoundedCluster.scour(doc, item, item);
      assert.eq(expected.words, Arr.map(actual.words(), function (x) { return x.word(); }));
      assert.eq(expected.items, Arr.map(actual.zone().elements(), function (x) { return x.id; }));
    };

    // check({
    //   words: [ 'one', 'two', 'one', 'two', 'die', 'but', 'another' ],
    //   items: [ 'div1' ]
    // }, 'div1');

    (function () {
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
              // Two consecutive english spans, so all should be in the same section.
              // Maybe just a known limitation of this approach. It would need to know
              // not to break them up into sections because the next section is the same
              // language.
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

      var check = function (expected, id) {
        var item = doc2.find(doc2.get(), id).getOrDie();
        var actual = BoundedCluster.scour(doc2, item, item);
        assert.eq(expected.words, Arr.map(actual.words(), function (x) { return x.word(); }));
        assert.eq(expected.items, Arr.map(actual.zone().elements(), function (x) { return x.id; }));
      };

      check({
        words: [ 'one', 'two', 'die', 'e', 'undinside', 'butter', 'another' ],
        items: [ 'div1' ]
      }, 'div1');

    })();

    // check({
    //   words: [ 'one', 'two' ],
    //   items: [ 'div1' ]
    // }, 'div2');
  }
);