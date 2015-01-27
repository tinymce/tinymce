test(
  'ClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.words.Cluster'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Cluster) {
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
      assert.eq(expected.words, Arr.map(actual.words(), function (x) { return x.word(); }));
      assert.eq(expected.items, Arr.map(actual.zone().elements(), function (x) { return x.id; }));
    };

    check({ words: [ 'determined', 'and'], items: [ 'd', 'e', 'f' ] }, 'e');
    check({ words: [ 'again' ], items: [ 'i' ] }, 'i');
    check({ words: [ 'and', 'it\'s', 'driving', 'me', 'insane' ], items: [ 'f', 'g', 'h' ] }, 'g');
    check({ words: [ 'What', 'now' ], items: [ 'j' ] }, 'j');
  }
);
