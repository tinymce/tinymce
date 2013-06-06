test(
  'ParentsTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.phoenix.ghetto.family.GhettoParents'
  ],

  function (Gene, TestUniverse, GhettoParents) {
    var doc = TestUniverse(
      Gene('root', 'root', [
        Gene('a', '', [
          Gene('aa', '', [
            Gene('aaa', '', []),
            Gene('aab', '', [
              Gene('aaba', '', [
                Gene('aabaa', '', []),
                Gene('aabab', '', [])
              ])
            ])
          ]),
          Gene('ab', '', [
            Gene('aba', '', []),
            Gene('abb', '', []),
            Gene('abc', '', [
              Gene('abca', '', []),
              Gene('abcb', '', []),
              Gene('abcc', '', [
                Gene('abcca', '', [])
              ])
            ])
          ]),
          Gene('ac', '', [
            Gene('aca', '', [])
          ])
        ]),
        Gene('b', '', [])
      ])
    );

    var check = function (expected, first, last) {
      var start = doc.find(doc.get(), first).getOrDie();
      var finish = doc.find(doc.get(), last).getOrDie();
      var actual = GhettoParents.common(doc, start, finish);
      assert.eq(expected, actual.getOrDie().id);
    };

    check('abc', 'abc', 'abcc');
    check('a', 'aa', 'abcca');
    check('b', 'b', 'b');
    check('ab', 'aba', 'abb');
  }
);
