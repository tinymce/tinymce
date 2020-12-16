import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import { ArbTextIds, arbTextIds } from 'ephox/robin/test/Arbitraries';
import * as Clustering from 'ephox/robin/words/Clustering';
import { WordDecisionItem } from 'ephox/robin/words/WordDecision';
import { LanguageZones } from 'ephox/robin/zone/LanguageZones';

UnitTest.test('ClusteringTest', () => {
  const checkWords = (universe: TestUniverse, words: WordDecisionItem<Gene>[]) => {
    return Arr.map(words, (a) => {
      const text = universe.property().getText(a.item);
      return text.substring(a.start, a.finish);
    });
  };

  const check = (label: string, universe: TestUniverse, expLeft: string[], expMiddle: string[], expRight: string[], expLang: Optional<string>, id: string) => {
    Logger.sync(
      id + ' => check: ' + label,
      () => {
        const act = Clustering.byLanguage(universe, universe.find(universe.get(), id).getOrDie());
        Assert.eq('start: ' + id + ', check left()', expLeft, checkWords(universe, act.left));
        Assert.eq('start: ' + id + ', check middle()', expMiddle, checkWords(universe, act.middle));
        Assert.eq('start: ' + id + ', check right()', expRight, checkWords(universe, act.right));
        Assert.eq(
          () => 'start: ' + id + ', check lang(): expected: ' + expLang.toString() + ', actual: ' + act.lang.toString(),
          true, expLang.equals(act.lang)
        );
        // .all() is:  tfel + middle + right
        Assert.eq('start: ' + id + ', check all()', Arr.reverse(expLeft).concat(expMiddle).concat(expRight), checkWords(universe, act.all));
      }
    );
  };

  const testSanity = () => {
    const universe = TestUniverse(
      Gene('root', 'root', [
        TextGene('root.text1.id', 'z0a'),
        TextGene('root.text1.id', 'z0b'),
        Gene('p1.id', 'p', [
          TextGene('p1.text1.id', 'z1a'),
          TextGene('p1.text2.id', 'z1b'),
          Gene('p1.img.id', 'img'),
          TextGene('p1.text3.id', 'z2a')
        ]),
        Gene('p2.id', 'p', [
          TextGene('p2.text1.id', 'z3a'),
          TextGene('p2.text2.id', 'z3b'),
          Gene('p2.span1.id', 'span', [
            TextGene('p2.span1.text1.id', 'z3c')
          ]),
          Gene('p2.span2.id', 'span', [
            TextGene('p2.span2.text1.id', 'z4a')
          ], {}, { lang: 'FR' })
        ], {}, { lang: 'DE' }),
        Gene('p3.id', 'p', [
          TextGene('p3.text1.id', ' '),
          TextGene('p3.text2.id', 'do'),
          TextGene('p3.text3.id', 'g and'),
          TextGene('p3.text4.id', ' bone')
        ])
      ])
    );

    check(
      'Left: stopped by p1, middle: itself, right: stopped by img',
      universe,
      [],
      [ 'z1a' ],
      [ 'z1b' ],
      Optional.none(),
      'p1.text1.id'
    );

    check(
      'Left: stopped by p1, middle: itself, right: stopped by img',
      universe,
      [ 'z1a' ],
      [ 'z1b' ],
      [],
      Optional.none(),
      'p1.text2.id'
    );

    check(
      'Left: stopped by img, middle: itself, right: stopped by p2',
      universe,
      [],
      [ 'z2a' ],
      [],
      Optional.none(),
      'p1.text3.id'
    );

    check(
      'Left: stopped by p2, middle: itself, right: stopped by p1.span2 lang',
      universe,
      [],
      [ 'z3a' ],
      [ 'z3b', 'z3c' ],
      Optional.some('DE'),
      'p2.text1.id'
    );

    check(
      'Left: stopped by p2, middle: itself, right: stopped by p1.span2 lang',
      universe,
      [ 'z3a' ],
      [ 'z3b' ],
      [ 'z3c' ],
      Optional.some('DE'),
      'p2.text2.id'
    );

    check(
      'Left: stopped by p2, middle: itself, right: stopped by p1.span2 lang',
      universe,
      [ 'z3b', 'z3a' ], // intentionally ordered that way for "left" call, but not "all"
      [ 'z3c' ],
      [],
      Optional.some('DE'),
      'p2.span1.text1.id'
    );

    check(
      'Left: stopped by p2.span2 lang, middle: itself, right: stopped by p2.span2 lang',
      universe,
      [],
      [ 'z4a' ],
      [],
      Optional.some('FR'),
      'p2.span2.text1.id'
    );

    check(
      'Left: stopped by p3, middle: itself, right: stopped by space in "g and"',
      universe,
      [],
      [ ' ' ],
      [ 'do', 'g' ],
      Optional.none(),
      'p3.text1.id'
    );

    check(
      'Left: stopped by " ", middle: itself, right: stopped by space in "g and"',
      universe,
      [],
      [ 'do' ],
      [ 'g' ],
      Optional.none(),
      'p3.text2.id'
    );

    check(
      'Left: stopped by " ", middle: itself, right: stopped by space in " bone"',
      universe,
      [ 'do' ],
      [ 'g and' ],
      [],
      Optional.none(),
      'p3.text3.id'
    );

    check(
      'Left: stopped by space in "g and", middle: itself, right: stopped by p3',
      universe,
      [ 'and' ],
      [ ' bone' ],
      [],
      Optional.none(),
      'p3.text4.id'
    );

  };

  interface ClusteringLangs {
    readonly all: WordDecisionItem<Gene>[];
    readonly left: WordDecisionItem<Gene>[];
    readonly middle: WordDecisionItem<Gene>[];
    readonly right: WordDecisionItem<Gene>[];
    readonly lang: Optional<string>;
  }

  const checkProps = (universe: TestUniverse, textIds: string[], start: Gene, actual: ClusteringLangs) => {
    const checkGroup = (label: string, group: WordDecisionItem<Gene>[]) => {
      const items = Arr.map(group, (g) => {
        return g.item;
      });
      Arr.each(items, (x) => {
        Assert.eq('Checking everything in ' + label + ' has same language', LanguageZones.calculate(universe, x).getOr('none'), actual.lang.getOr('none'));
        Assert.eq(
          'Check that everything in the ' + label + ' is a text node',
          true,
          universe.property().isText(x)
        );
      });
    };

    Assert.eq('Check that the language matches the start', LanguageZones.calculate(universe, start).getOr('none'), actual.lang.getOr('none'));
    checkGroup('left', actual.left);
    checkGroup('middle', actual.middle);
    checkGroup('right', actual.right);

    Arr.each(actual.all, (x, i) => {
      if (i > 0) {
        const prev = actual.all[i - 1].item.id;
        const current = x.item.id;
        Assert.eq(
          'The text nodes should be one after the other',
          +1,
          textIds.indexOf(current) - textIds.indexOf(prev)
        );
      }
    });

    const blockParent = universe.up().predicate(start, universe.property().isBoundary).getOrDie('No block parent tag found');
    Arr.each(actual.all, (x) => {
      Assert.eq(
        'All block ancestor tags should be the same as the original',
        blockParent,
        universe.up().predicate(x.item, universe.property().isBoundary).getOrDie('No block parent tag found')
      );
    });
  };

  const propertyTest = (label: string, universe: TestUniverse) => {
    Logger.sync(
      label,
      () => {
        Jsc.property(
          label + ': Checking that text nodes have consistent zones',
          arbTextIds(universe),
          (idInfo: ArbTextIds) => {
            const startId = idInfo.startId;
            const textIds = idInfo.textIds;
            if (startId === 'root') {
              return true;
            }
            const start = universe.find(universe.get(), startId).getOrDie();
            if (universe.property().isBoundary(start)) {
              return true;
            }
            const actual = Clustering.byLanguage(universe, start);
            checkProps(universe, textIds, start, actual);
            return true;
          }
        );
      }
    );
  };

  testSanity();

  propertyTest(
    'Testing with no languages at all',
    TestUniverse(
      Gene('root', 'root', [
        Gene('p1', 'p', [
          TextGene('this_is_', 'This is '),
          TextGene('going_', 'going '),
          Gene('s1', 'span', [
            TextGene('to', 'to'),
            Gene('b1', 'b', [
              TextGene('_b', ' b')
            ]),
            TextGene('e', 'e'),
            TextGene('_more', ' more')
          ])
        ]),
        Gene('p2', 'p', [
          TextGene('th', 'th'),
          TextGene('a', 'a'),
          TextGene('n', 'n'),
          TextGene('one_', 'one '),
          Gene('i1', 'i', [
            TextGene('para', 'para'),
            TextGene('graph', 'graph')
          ])
        ]),
        Gene('p3', 'p', [
          Gene('p3s1', 'span', [
            Gene('p3s2', 'span', [
              Gene('p3s3', 'span', [
                TextGene('end', 'end')
              ])
            ])
          ])
        ]),

        Gene('p4', 'p', [
          Gene('p4s1', 'span', [
            TextGene('p4sp', 'sp'),
            Gene('p4s2', 'span', [
              TextGene('p4l', 'l'),
              Gene('p4s3', 'span', [
                TextGene('p4it', 'it'),
                TextGene('p4word', 'word')
              ]),
              TextGene('p4and', 'and')
            ]),
            TextGene('p4_not_', ' not ')
          ]),
          TextGene('p4_this_', ' this ')
        ])
      ])
    )
  );

  propertyTest(
    'Testing with no root language',
    TestUniverse(
      Gene('root', 'root', [
        Gene('p1', 'p', [
          Gene('p1s1', 'span', [
            TextGene('p1sp', 'sp'),
            Gene('p1s2', 'span', [
              TextGene('p1l', 'l'),
              Gene('p1s3', 'span', [
                TextGene('p1it', 'it'),
                TextGene('p1word', 'word')
              ], {}, { lang: 'FR' }),
              TextGene('p1and', 'and')
            ]),
            TextGene('p1_not_', ' not ')
          ]),
          TextGene('p1_this_', ' this ')
        ]),
        Gene('p2', 'p', [
          Gene('p2s1', 'span', [
            TextGene('p2sp', 'sp'),
            Gene('p2s2', 'span', [
              TextGene('p2l', 'l'),
              Gene('p2s3', 'span', [
                TextGene('p2it', 'it'),
                TextGene('p2word', 'word')
              ]),
              TextGene('p2and', 'and')
            ]),
            TextGene('p2_not_', ' not ')
          ]),
          TextGene('p2_this_', ' this ')
        ], {}, { lang: 'DE' }),
        Gene('p3', 'p', [
          Gene('p3s1', 'span', [
            TextGene('p3sp', 'sp'),
            Gene('p3s2', 'span', [
              TextGene('p3l', 'l'),
              Gene('p3s3', 'span', [
                TextGene('p3it', 'it'),
                TextGene('p3word', 'word')
              ], {}, { lang: 'FR' }),
              TextGene('p3and', 'and')
            ]),
            TextGene('p3_not_', ' not ')
          ]),
          TextGene('p3_this_', ' this ')
        ], {}, { lang: 'DE' })
      ])
    )
  );

  propertyTest(
    'Testing with DE as root language',
    TestUniverse(
      Gene('root', 'root', [
        Gene('p1', 'p', [
          Gene('p1s1', 'span', [
            TextGene('p1sp', 'sp'),
            Gene('p1s2', 'span', [
              TextGene('p1l', 'l'),
              Gene('p1s3', 'span', [
                TextGene('p1it', 'it'),
                TextGene('p1word', 'word')
              ], {}, { lang: 'FR' }),
              TextGene('p1and', 'and')
            ]),
            TextGene('p1_not_', ' not ')
          ]),
          TextGene('p1_this_', ' this ')
        ])
      ], {}, { lang: 'DE' })
    )
  );
});
