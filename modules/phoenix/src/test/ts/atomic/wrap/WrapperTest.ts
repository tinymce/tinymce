import { assert, UnitTest } from '@ephox/bedrock';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';
import * as Wrapper from 'ephox/phoenix/wrap/Wrapper';
import { Wraps } from 'ephox/phoenix/wrap/Wraps';

UnitTest.test('WrapperTest', function () {
  const make = function () {
    return TestUniverse(
      Gene('root', 'root', [
        Gene('1', 'span', [
          TextGene('1.1', 'alpha'),
          TextGene('1.2', 'beta'),
          TextGene('1.3', 'gamma')
        ]),
        Gene('2', 'span', [
          TextGene('1.4', 'delta')
        ]),
        Gene('3', 'span', [
          TextGene('1.5', 'rho'),
          Gene('img', 'img'),
          TextGene('1.6', 'epsilon')
        ]),
        Gene('4', 'br', [])
      ])
    );
  };

  const check = function (postTest: string, expected: string[], startId: string, startOffset: number, finishId: string, finishOffset: number) {
    const doc = make();
    const start = Finder.get(doc, startId);
    const finish = Finder.get(doc, finishId);
    const predicate = function (item: Gene) {
      return item.name === 'span';
    };

    let counter = 0;
    const nu = function () {
      counter++;
      return Wraps(doc, Gene('new-span-' + counter, 'span', []));
    };

    const actual = Wrapper.reuse(doc, start, startOffset, finish, finishOffset, predicate, nu);
    assert.eq(expected, TestRenders.ids(actual));
    assert.eq(postTest, doc.shortlog(function (item) {
      return item.name === 'TEXT_GENE' ? 'text("' + item.text + '")' : item.id;
    }));
  };

  check('root(1(new-span-1(text("alpha"),text("b")),text("eta"),text("gamma")),2(text("delta")),3(text("rho"),img,text("epsilon")),4)', [
    'new-span-1'
  ], '1.1', 0, '1.2', 1);

  check('root(1(text("alpha"),text("b"),new-span-1(text("eta"),text("gamma"))),2(text("delta")),3(new-span-2(text("rho")),img,text("epsilon")),4)', [
    'new-span-1',
    '2',
    'new-span-2'
  ], '1.2', 1, '1.5', 3);

  check('root(1(text("alpha"),text("beta"),text("gamma")),2(text("delta")),3(new-span-1(text("rho")),img,text("epsilon")),4)', [
    '1',
    '2',
    'new-span-1'
  ], '1.1', 0, '1.5', 3);

  check('root(1(text("alpha"),text("beta"),text("gamma")),2(text("delta")),3(new-span-1(text("rho")),img,text("epsilon")),4)', [
    '1',
    '2',
    'new-span-1'
  ], '1.1', 0, '1.5', 3);

  check('root(1(text("alpha"),text("beta"),text("gamma")),2(text("delta")),3(new-span-1(text("rho")),img,new-span-2(text("epsilon"))),4)', [
    '1',
    '2',
    'new-span-1',
    'new-span-2'
  ], '1.1', 0, 'root', 3);
});

