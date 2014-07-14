test(
  'BreakerTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.boss.mutant.Logger',
    'ephox.compass.Arr',
    'ephox.robin.parent.Breaker'
  ],

  function (Gene, TestUniverse, TextGene, Logger, Arr, Breaker) {
    var generator = function () {
      return TestUniverse(Gene('root', 'root', [
        Gene('d1', 'div', [
          TextGene('d1_t1', 'List: '),
          Gene('ol1', 'ol', [
            Gene('li1', 'li', [
              TextGene('li1_text', 'Apples')
            ]),
            Gene('li2', 'li', [
              TextGene('li2_text', 'Beans')
            ]),
            Gene('li3', 'li', [
              TextGene('li3_text', 'Carrots')
            ]),
            Gene('li4', 'li', [
              TextGene('li4_text', 'Diced Tomatoes')
            ])
          ])
        ])
      ]));
    };

    var doc1 = generator();
    Breaker.breakAt(doc1, doc1.find(doc1.get(), 'ol1').getOrDie(), doc1.find(doc1.get(), 'li3').getOrDie());
    assert.eq(
      'root(' +
        'd1(' +
          'd1_t1,' +
          'ol1(' +
            'li1(li1_text),li2(li2_text),li3(li3_text)' +
          '),' +
          'clone**<ol1>(' +
            'li4(li4_text)' +
          ')' +
        ')' +
      ')', Logger.basic(doc1.get()));


    var doc2 = generator();
    var result = Breaker.breakPath(doc2, doc2.find(doc2.get(), 'li2_text').getOrDie(), function (item) {
      return item.name === 'ol';
    }, Breaker.breakAt);

    assert.eq('ol1', result.first().id);
    assert.eq('clone**<ol1>', result.second().getOrDie().id);
    assert.eq([ 'li2->clone**<li2>', 'ol1->clone**<ol1>' ], Arr.map(result.splits(), function (spl) {
      return spl.first().id + '->' + spl.second().id;
    }));
  }
);
