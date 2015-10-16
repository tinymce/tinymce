test(
  'GroupTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.compass.Arr',
    'ephox.phoenix.family.Group',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders'
  ],

  function (Gene, TestUniverse, TextGene, Arr, Group, Finder, TestRenders) {
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

    var check = function (expected, ids) {
      var items = Arr.map(ids, function (id) {
        return Finder.get(doc, id);
      });
      var actual = Group.group(doc, items);
      assert.eq(expected, Arr.map(actual, function (xs) {
        return Arr.map(xs, TestRenders.typeditem);
      }));
    };

    check([
      [ 'empty(1.1.1)' ],
      [ 'text("post-image text")' ],
      [ 'text("This is text")', 'text("inside a span")', 'text("More text")', 'text("Inside em")', 'text("Last piece of text")' ]
    ], [ '1' ]);

    check([
      [ 'empty(1.1.1)' ],
      [ 'text("post-image text")' ]
    ], [ '1.1' ]);

  }
);
