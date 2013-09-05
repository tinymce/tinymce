test(
  'BlockTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.robin.api.general.Look',
    'ephox.robin.api.general.Parent',
    'ephox.robin.test.Assertions'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Option, Look, Parent, Assertions) {
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
        ]),
        Gene('ol2', 'ol', [
          Gene('li5', 'li', [
            TextGene('li5_text', 'Elephants')
          ])
        ])
      ])
    ]));

    var check = function (expected, ids, look) {
      var items = Arr.map(ids, function (id) {
        return doc.find(doc.get(), id).getOrDie();
      });
      var actual = Parent.sharedOne(doc, look, items);
      Assertions.assertOptComp(expected, actual, function (e, a) {
        assert.eq(e, a.id);
      });
    };

    check(Option.some('ol1'), ['li2'], Look.selector(doc, 'ol'));
    check(Option.some('ol1'), ['li2', 'li3', 'li4_text'], Look.selector(doc, 'ol'));
    check(Option.none(), ['li2', 'li5'], Look.selector(doc, 'ol'));

  }
);
