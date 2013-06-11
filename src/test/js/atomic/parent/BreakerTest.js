test(
  'BreakerTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.boss.mutant.Logger',
    'ephox.robin.parent.Breaker'
  ],

  function (Gene, TestUniverse, TextGene, Logger, Breaker) {

    var breakAt = function (universe, parent, child) {
      var parts = bisect(universe, parent, child);
      return parts.map(function (ps) {
        return unsafeBreakAt(universe, parent, ps);
      });
    };


    var doc = TestUniverse(Gene('root', 'root', [
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

    Breaker.breakAt(doc, doc.find(doc.get(), 'ol1').getOrDie(), doc.find(doc.get(), 'li3').getOrDie());
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
      ')', Logger.basic(doc.get()));

  }
);
