test(
  'WrapperTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders',
    'ephox.phoenix.wrap.Wrapper'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Finder, TestRenders, Wrapper) {
    // I'll just do a slightly efficient thing now. I'll work towards the more
    // efficient approach later.
    var doc = TestUniverse(
      Gene('root', 'root', [
        Gene('1', 'span', [
          TextGene('1.1', 'alpha'),
          TextGene('1.2', 'beta'),
          TextGene('1.3', 'gamma')
        ]),
        Gene('2', 'span', [
          TextGene('1.4')
        ]),
        Gene('3', 'span', [
          TextGene('1.5'),
          TextGene('1.6')
        ])
      ])
    );

    var check = function (expected, ids) {
      var actual = Wrapper.viper(doc, Finder.getAll(doc, ids));
      assert.eq(expected.length, actual.length);
      Arr.each(expected, function (exp, i) {
        var act = actual[i];
        assert.eq(exp.parent, act.parent.id);
        assert.eq(exp.children, TestRenders.ids(act.children));
      });
    };
      
    check([
      { parent: '1', children: [ '1.1', '1.2', '1.3' ] }
    ], [ '1.1', '1.2', '1.3' ]);

    check([
      { parent: '1', children: [ '1.1', '1.2', '1.3' ] },
      { parent: '2', children: [ '1.4' ] },
      { parent: '3', children: [ '1.5', '1.6' ] }
    ], [ '1.1', '1.2', '1.3', '1.4', '1.5', '1.6' ]);
  }
);

