test(
  'WrapperTest',

  [
    'ephox.boss.api.Gene',
    'ephox.boss.api.TestUniverse',
    'ephox.boss.api.TextGene',
    'ephox.boss.mutant.Logger',
    'ephox.phoenix.api.general.Extract',
    'ephox.phoenix.api.general.Wrapping',
    'ephox.phoenix.test.Finder',
    'ephox.phoenix.test.TestRenders'
  ],

  function (Gene, TestUniverse, TextGene, Logger, Extract, Wrapping, Finder, TestRenders) {
    var doc = TestUniverse(
      Gene('root', 'root', [
        Gene('a', '', [
          Gene('aa', '', [
            TextGene('aaa', 'once upon a time'),
            Gene('aab', '', [
              Gene('aaba', '', [
                Gene('aabaa', 'img', []),
                TextGene('aabab', ' there was a dragon')
              ])
            ])
          ]),
          Gene('ab', '', [
            TextGene('aba', ' called '),
            TextGene('abb', ' not-dragon, '),
            Gene('abc', '', [
              Gene('abca', 'br', []),
              TextGene('abcb', 'and that dragon'),
              TextGene('abcc', 'stayed in a far away land'),
              Gene('abcd', '', [
                TextGene('abcda', 'free of contaminants')
              ])
            ])
          ]),
          Gene('ac', '', [
            TextGene('aca', ' --- OCD he was, ')
          ])
        ]),
        TextGene('b', 'yes')
      ])
    );

    var counter = 0;
    var factory = function () {
      console.log('running');
      var item = { id: 'wrap_' + counter };
      counter++;
      return Wrapping.nu(doc, item);
    };

    var dump = function () {
      return Logger.custom(doc.get(), function (item) {
        return doc.property().isText(item) ? item.id + '("' + item.text + '")' : item.id;
      });
    };

    // Let's just do stuff.
    Wrapping.leaves(doc, Finder.get(doc, 'aa'), 1, Finder.get(doc, 'aca'), 4, factory);
    assert.eq(
      'root(' +
        'a(' +
          'aa(' +
            'aaa("once upon a time"),' +
            'aab(' +
              'aaba(' +
                'aabaa,' +
                'wrap_0(aabab(" there was a dragon"))' +
              ')' +
            ')' +
          '),' +
          'ab(' +
            'wrap_1(aba(" called ")),' +
            'wrap_2(abb(" not-dragon, ")),' +
            'abc(' +
              'abca,' +
              'wrap_3(abcb("and that dragon")),' +
              'wrap_4(abcc("stayed in a far away land")),' +
              'abcd(' +
                'wrap_5(abcda("free of contaminants"))' +
              ')' +
            ')' +
          '),' +
          'ac(' +
            'wrap_6(aca(" ---")),' +
            '?_ OCD he was, (" OCD he was, ")' +
          ')' +
        '),' +
        'b("yes")' +
      ')', dump());

  }
);
/*

Gene('ac', '', [
            TextGene('aca', ' --- OCD he was, ')
          ])
        ]),
        TextGene('b', 'yes')


            ])
          ]),*/ 