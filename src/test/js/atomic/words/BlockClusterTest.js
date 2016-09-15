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
        ]),
        Gene('p2', 'p', [
          TextGene('en-a', 'one'),
          Gene('image2', 'img', [ ]),
          TextGene('en-b', 'tw'),
          TextGene('en-c', 'o'),
          Gene('de', 'span', [
            TextGene('de-a', 'di'),
            TextGene('de-b', 'e')
          ], {}, { lang: 'de' })  
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
      words: [ 'one', 'two', 'one', 'two', 'die' ],
      items: [ 'div1' ]
    }, 'div1');

    // check({
    //   words: [ 'one', 'two' ],
    //   items: [ 'div1' ]
    // }, 'div2');
  }
);