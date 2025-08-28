import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';

import * as Fractures from 'ephox/robin/clumps/Fractures';

UnitTest.test('FracturesTest', () => {
  const regen = () => {
    return TestUniverse(Gene('root', 'root', [
      Gene('a', 'span', [
        Gene('aa', 'span', [
          TextGene('aaa', 'aaa'),
          TextGene('aab', 'aab'),
          TextGene('aac', 'aac')
        ]),
        TextGene('ab', 'ab'),
        Gene('ac', 'span', [
          TextGene('aca', 'aca'),
          Gene('acb', 'span', [
            TextGene('acba', 'acba'),
            Gene('acbb', 'span', [
              TextGene('acbba', 'acbba')
            ])
          ])
        ])
      ]),
      TextGene('b', 'b'),
      Gene('c', 'span', [
        TextGene('ca', 'ca'),
        Gene('cb', 'span', [
          Gene('c', 'span', [
            TextGene('cbaa', 'cbaa'),
            TextGene('cbab', 'cbab')
          ]),
          TextGene('cbb', 'cbb')
        ])
      ])
    ]));
  };

  const isRoot = (item: Gene) => {
    return item.name === 'root';
  };

  const check = (expected: string, startId: string, finishId: string, doc: TestUniverse = regen()) => {
    const start = doc.find(doc.get(), startId).getOrDie();
    const finish = doc.find(doc.get(), finishId).getOrDie();
    const actual = Fractures.fracture(doc, isRoot, start, finish);
    actual.each((act) => {
      const wrapper = doc.create().nu('bold');
      if (act.length > 0) {
        doc.insert().before(act[0], wrapper);
        doc.insert().appendAll(wrapper, act);
      }
    });
    Assert.eq('', expected, doc.shortlog((item) => {
      return doc.property().isText(item) ? '"' + item.text + '"' : item.name;
    }));
  };

  check(
    'root(' +
    'span(' +
    'span,' +
    'bold(' +
    'span(' +
    '"aaa",' +
    '"aab",' +
    '"aac"' +
    '),' +
    '"ab",' +
    'span(' +
    '"aca",' +
    'span(' +
    '"acba",' +
    'span(' +
    '"acbba"' +
    ')' +
    ')' +
    ')' +
    '),' +
    'span(span(span))' +
    ')' +
    ')', 'aaa', 'acbba', TestUniverse(Gene('root', 'root', [
      Gene('a', 'span', [
        Gene('aa', 'span', [
          TextGene('aaa', 'aaa'),
          TextGene('aab', 'aab'),
          TextGene('aac', 'aac')
        ]),
        TextGene('ab', 'ab'),
        Gene('ac', 'span', [
          TextGene('aca', 'aca'),
          Gene('acb', 'span', [
            TextGene('acba', 'acba'),
            Gene('acbb', 'span', [
              TextGene('acbba', 'acbba')
            ])
          ])
        ])
      ])
    ]))
  );

  // Needs ancestor scanning and breaker.left
  // check('root(p(font(span,bold(span("text")))))', 'c', 'b', TestUniverse(Gene('root', 'root', [
  //   Gene('p1', 'p', [
  //     Gene('a', 'font', [
  //       Gene('b', 'span', [
  //         TextGene('c', 'text')
  //       ])
  //     ])
  //   ])
  // ])));

  /*
  Basic
  'root(' +
    'span(' +
      'span(' +
        '"aaa",' +
        '"aab",' +
        '"aac"' +
      '),' +
      '"ab",' +
      'span(' +
        '"aca",' +
        'span(' +
          '"acba",' +
          'span(' +
            '"acbba"' +
          ')' +
        ')' +
      ')' +
    '),' +
    '"b",' +
    'span(' +
      '"ca",' +
      'span(' +
        'span(' +
          '"cbaa",' +
          '"cbab"' +
        '),' +
        '"cbb"' +
      ')' +
    ')' +
  ')',
  */

  // check(
  //   'root(span(span(bold("aaa","aab","aac")),"ab",span("aca",span("acba",span("acbba")))),"b",span("ca",span(span("cbaa","cbab"),"cbb")))',
  //   'aaa', 'aac'
  // );

  // check(
  //   'root(' +
  //     'span(' +
  //       'span(' +
  //         'bold(' +
  //           '"aaa",' +
  //           '"aab",' +
  //           '"aac"' +
  //         ')' +
  //       '),' +
  //       '"ab",' +
  //       'span(' +
  //         '"aca",' +
  //         'span(' +
  //           '"acba",' +
  //           'span(' +
  //             '"acbba"' +
  //           ')' +
  //         ')' +
  //       ')' +
  //     '),' +
  //     '"b",' +
  //     'span(' +
  //       '"ca",' +
  //       'span(' +
  //         'span(' +
  //           '"cbaa",' +
  //           '"cbab"' +
  //         '),' +
  //         '"cbb"' +
  //       ')' +
  //     ')' +
  //   ')',
  //   'aaa', 'aac');

  check(
    'root(' +
    'span(' +
    'span,' +
    'bold(' +
    'span(' +
    '"aaa",' +
    '"aab",' +
    '"aac"' +
    '),' +
    '"ab",' +
    'span(' +
    '"aca",' +
    'span(' +
    '"acba",' +
    'span(' +
    '"acbba"' +
    ')' +
    ')' +
    ')' +
    '),' +
    'span(span(span))' +
    '),' +
    '"b",' +
    'span(' +
    '"ca",' +
    'span(' +
    'span(' +
    '"cbaa",' +
    '"cbab"' +
    '),' +
    '"cbb"' +
    ')' +
    ')' +
    ')',
    'aaa', 'acbba');
});
