test(
  'NavigationTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.wrap.Navigation'
  ],

  function (Gene, TestUniverse, TextGene, Finder, Navigation) {
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

    var checkLast = function (expected, id) {
      var actual = Navigation.toLast(doc, Finder.get(doc, id));
      assert.eq(expected.element, actual.element().id);
      assert.eq(expected.offset, actual.offset());
    };

    var checkLower = function (expected, id) {
      var actual = Navigation.toLower(doc, Finder.get(doc, id));
      assert.eq(expected.element, actual.element().id);
      assert.eq(expected.offset, actual.offset());
    };

    var checkLeaf = function (expected, id, offset) {
      var actual = Navigation.toLeaf(doc, Finder.get(doc, id), offset);
      assert.eq(expected.element, actual.element().id);
      assert.eq(expected.offset, actual.offset());
    };

    checkLower({ element: '1', offset: 2 }, '1');
    checkLower({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2.5');

    checkLast({ element: '1.2.5', offset: 'Last piece of text'.length }, '1');
    checkLast({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2.5');

    checkLeaf({ element: '1.1.2', offset: 0 }, '1.1', 1);
    checkLeaf({ element: '1.1.2', offset: 'post-image text'.length }, '1.1', 2);
    checkLeaf({ element: '1.2.2.1', offset: 0 }, '1.2', 1);
    checkLeaf({ element: '1.2.5', offset: 'Last piece of text'.length }, '1.2', 5);

  }
);
