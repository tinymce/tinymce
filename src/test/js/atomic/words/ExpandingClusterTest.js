test(
  'ExpandingClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.perhaps.Option',
    'ephox.robin.test.ZoneObjects',
    'ephox.robin.words.ExpandingCluster'
  ],

  function (Gene, TestUniverse, TextGene, Option, ZoneObjects, ExpandingCluster) {
     var check = function (universe, expected, id) {
      var item = universe.find(universe.get(), id).getOrDie();
      var actual = ExpandingCluster.scour(universe, item, 'en');
      ZoneObjects.assertZones('Starting on: ' + id, universe, expected, actual.zones());
    };

    var doc1 = TestUniverse(Gene('root', 'root', [
      Gene('p1', 'p', [
        TextGene('a', 'There i'),
        TextGene('b', 's something'),
        TextGene('c', ' going on here that can'),
        TextGene('d', 'not be de'),
        TextGene('e', 'termined '),
        TextGene('f', 'and'),
        TextGene('g', ' it\'s driving me in'),
        Gene('s1', 'span', [
          TextGene('h', 'sane')
        ]),
        Gene('image', 'img', []),
        TextGene('i', 'again.')
      ]),
      Gene('p2', 'p', [
        TextGene('j', 'What now?')
      ])
    ]));

   

    check(doc1, [{
      words: [ 'determined', 'and'],
      elements: [ 'd', 'e', 'f' ],
      // FIX: Default language sensibly
      lang: 'en'
    }], 'e');

    check(doc1, [{
      words: [ 'again' ],
      elements: [ 'i' ],
      lang: 'en'
    }], 'i');

    check(doc1, [{
      words: [ 'and', 'it\'s', 'driving', 'me', 'insane' ],
      elements: [ 'f', 'g', 'h' ],
      lang: 'en'
    }], 'g');

    check(doc1, [{
      words: [ 'What', 'now' ],
      elements: [ 'j' ],
      lang: 'en'
    }], 'j');


    var doc2 = TestUniverse(Gene('root', 'root', [
      Gene('p1', 'p', [
        Gene('de-1', 'span', [
          TextGene('de-a', 'das')
        ], { }, { lang: 'de' }),
        TextGene('en-1', 'w'),
        TextGene('en-2', 'or'),
        TextGene('en-3', 'd')
      ])
    ]));

    check(doc2, [{
      words: [ 'word' ],
      elements: [ 'en-1', 'en-2', 'en-3' ],
      lang: 'en'
    }], 'en-1');

    check(doc2, [{
      words: [ 'word' ],
      elements: [ 'en-1', 'en-2', 'en-3' ],
      lang: 'en'
    }], 'en-2');

    check(doc2, [{
      words: [ 'word' ],
      elements: [ 'en-1', 'en-2', 'en-3' ],
      lang: 'en'
    }], 'en-3');
  }
);
