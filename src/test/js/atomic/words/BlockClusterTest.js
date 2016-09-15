test(
  'BlockClusterTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.robin.words.Cluster'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Cluster) {
    var doc = TestUniverse(Gene('root', 'root', [
      Gene('div1', 'div', [
        Gene('p1', 'p', [
          TextGene('a', 'one'),
          Gene('image', 'img', [ ]),
          TextGene('b', 'tw'),
          TextGene('c', 'o')
        ])
      ])
    ]));

    var check = function (expected, id) {
      var item = doc.find(doc.get(), id).getOrDie();
      var actual = Cluster.block(doc, item);
      assert.eq(expected.words, Arr.map(actual.words(), function (x) { return x.word(); }));
      assert.eq(expected.items, Arr.map(actual.zone().elements(), function (x) { return x.id; }));
    };

    check({
      words: [ 'one', 'two' ],
      items: [ 'div1' ]
    }, 'div1');
  }
);