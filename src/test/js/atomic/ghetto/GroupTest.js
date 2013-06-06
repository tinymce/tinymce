test(
  'GroupTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene'
  ],

  function (Gene, TestUniverse, TextGene) {
    var doc = TestUniverse(
      Gene('root', 'root', [
        Gene('1', 'div', [
          Gene('1.1', 'p', [
            Gene('1.1.1', 'img', []),
            TextGene('1.1.2', 'post-image text')
          ]),
          Gene('1.2', 'p', [
            TextGene('1.2.1', 'This is text'),
            Gene('1.2.2', 'span', [
              TextGene('1.2.2.1', 'inside a span')
            ]),
            TextGene('1.2.3', 'More text'),
            Gene('1.2.4', 'em', [
              TextGene('1.2.4.1', 'Inside em')
            ]),
            TextGene('1.2.5', 'Last piece of text')
          ])
        ])
      ])
    );

  }
);
