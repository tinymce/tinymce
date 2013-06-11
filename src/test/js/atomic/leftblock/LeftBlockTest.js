test(
  'LeftBlockTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.robin.api.general.LeftBlock'
  ],

  function (Gene, TestUniverse, TextGene, LeftBlock) {
    var universe = TestUniverse(Gene('root', 'root', [
      Gene('p1', 'p', [
        Gene('span1', 'span', [
          TextGene('s1-text', 'bolded-text')
        ]),
        Gene('span2', 'span', [
          TextGene('s2-text', 'italicised-text')
        ]),
        TextGene('t3', 'here')
      ])
    ]));

    LeftBlock.all(universe, universe.find(universe.get(), 't3').getOrDie());

  }
);
