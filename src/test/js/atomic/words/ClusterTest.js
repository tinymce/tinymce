test(
  'ClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.words.Cluster'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Option, Cluster) {
    var doc = TestUniverse(Gene('root', 'root', [
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

    var check = function (expected, id) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Cluster.generate(doc, item);
      var aZones = actual.zones();
      assert.eq(1, aZones.length);
      var aZone = aZones[0];
      assert.eq(expected.words, Arr.map(aZone.words(), function (x) { return x.word(); }));
      assert.eq(expected.items, Arr.map(aZone.elements(), function (x) { return x.id; }));
      assert.eq(true, Option.equals(expected.lang, aZone.lang()));
    };

    check({
      words: [ 'determined', 'and'],
      items: [ 'd', 'e', 'f' ],
      lang: Option.none()
    }, 'e');

    check({
      words: [ 'again' ],
      items: [ 'i' ],
      lang: Option.none()
    }, 'i');

    check({
      words: [ 'and', 'it\'s', 'driving', 'me', 'insane' ],
      items: [ 'f', 'g', 'h' ],
      lang: Option.none()
    }, 'g');

    check({
      words: [ 'What', 'now' ],
      items: [ 'j' ],
      lang: Option.none()
    }, 'j');

    (function () {
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

      var check2 = function (expected, id) {
        var item = doc2.find(doc2.get(), id).getOrDie();
        var actual = Cluster.generate(doc2, item);
        var aZones = actual.zones();
        assert.eq(1, aZones.length);
        var aZone = aZones[0];
        assert.eq(expected.words, Arr.map(aZone.words(), function (x) { return x.word(); }));
        assert.eq(expected.items, Arr.map(aZone.elements(), function (x) { return x.id; }));
        assert.eq(true, Option.equals(expected.lang, aZone.lang()));
      };

      check2({
        words: [ 'word' ],
        items: [ 'en-3' ],
        lang: Option.none()
      }, 'en-1');

      check2({
        words: [ 'word' ],
        items: [ 'en-3' ],
        lang: Option.none()
      }, 'en-2');

      check2({
        words: [ 'word' ],
        items: [ 'en-3' ],
        lang: Option.none()
      }, 'en-3');
    })();
  }
);
