test(
  'InsertAtTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.phoenix.insert.InsertAt',
    'ephox.phoenix.test.Finder'
  ],

  function (Gene, TestUniverse, TextGene, InsertAt, Finder) {
    var makeUniverse = function () {
      return TestUniverse(
        Gene('root', 'root', [
          Gene('a', 'node', [
            Gene('aa', 'node', [
              TextGene('aaa', 'aaa'),
              TextGene('aab', 'aab'),
              TextGene('aac', 'aac')
            ]),
            Gene('ab', 'node', [
              TextGene('aba', 'aba'),
              TextGene('abb', 'abb')
            ])
          ])
        ])
      );
    };

    var check = function (expected, element, offset, injection) {
      var universe = makeUniverse();
      var start = Finder.get(universe, element);
      InsertAt.atStartOf(universe, start, offset, injection);
      assert.eq(expected, universe.shortlog(function (item) {
        return item.name === 'TEXT_GENE' ? 'text("' + item.text + '")' : item.id;
      }));
    };

    // Start of a text node
    check('root(a(aa(text("INJECTED"),text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 0, TextGene('INJECTED', 'INJECTED'));

    // Middle of a text node
    check('root(a(aa(text("aa"),text("INJECTED"),text("a"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 2, TextGene('INJECTED', 'INJECTED'));

    // End of a text node
    check('root(a(aa(text("aaa"),text("INJECTED"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aaa', 'aaa'.length, TextGene('INJECTED', 'INJECTED'));

    // Valid child of parent.
    check('root(a(aa(text("INJECTED"),text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aa', 0, TextGene('INJECTED', 'INJECTED'));

    // Last child of parent.
    check('root(a(aa(text("aaa"),text("aab"),text("aac"),text("INJECTED")),ab(text("aba"),text("abb"))))', 'aa', 3, TextGene('INJECTED', 'INJECTED'));

    // Invalid child of parent.
    check('root(a(aa(text("aaa"),text("aab"),text("aac")),ab(text("aba"),text("abb"))))', 'aa', 6, TextGene('INJECTED', 'INJECTED'));
  }
);
