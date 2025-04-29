import { Assert, describe, it } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

import * as Splitter from 'ephox/phoenix/search/Splitter';
import * as Finder from 'ephox/phoenix/test/Finder';
import * as TestRenders from 'ephox/phoenix/test/TestRenders';

describe('SplitterTest', () => {

  interface CheckItem {
    id: string;
    start: number;
    finish: number;
    text: string;
  }

  const checkSubdivide = (toplevel: string[], expected: CheckItem[], id: string, positions: number[], data: Gene) => {
    const universe = TestUniverse(data);
    const item = Finder.get(universe, id);
    const actual = Splitter.subdivide(universe, item, positions);
    Assert.eq('Incorrect size for subdivide test', expected.length, actual.length);
    Arr.each(expected, (exp, i) => {
      const act = actual[i];
      // TODO: Consider removing an expected id from the test case as it isn't really representing anything meaningful
      Assert.eq('', exp.id, act.element.id);
      Assert.eq('comparing start for ' + exp.id + ': ' + exp.start + ' vs ' + act.start, exp.start, act.start);
      Assert.eq('comparing finish for ' + exp.id + ': ' + exp.finish + ' vs ' + act.finish, exp.finish, act.finish);
      Assert.eq('', exp.text, act.element.text);
    });

    Assert.eq('', toplevel, Arr.map(universe.get().children, TestRenders.text));
  };

  it('Run tests', () => {
    checkSubdivide([ '_', 'abcdefghijklm', 'n', 'opq', 'rstuvwxyz' ], [
      { id: 'a', start: 0, finish: 1, text: '_' },
      { id: '?_abcdefghijklm', start: 1, finish: 14, text: 'abcdefghijklm' },
      { id: '?_n', start: 14, finish: 15, text: 'n' },
      { id: '?_opq', start: 15, finish: 18, text: 'opq' },
      { id: '?_rstuvwxyz', start: 18, finish: 27, text: 'rstuvwxyz' }
    ], 'a', [ 1, 14, 15, 18 ], Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));

    checkSubdivide([ '_abcdefghijklmnopqrstuvwxyz' ], [
      { id: 'a', start: 0, finish: 27, text: '_abcdefghijklmnopqrstuvwxyz' }
    ], 'a', [ 100 ], Gene('root', 'root', [
      TextGene('a', '_abcdefghijklmnopqrstuvwxyz')
    ]));
  });

  it('TINY-11560: Invalid input produces invalid output', () => {
    checkSubdivide(
      [ 'D.', ' ', 'dd.D', 'D', 'D.' ],
      [
        { id: 'p', start: 0, finish: 2, text: 'D.' },
        { id: '?_ ', start: 2, finish: 3, text: ' ' },
        { id: '?_dd.D', start: 3, finish: 7, text: 'dd.D' },
        { id: '?_D', start: 7, finish: 8, text: 'D' },
        { id: '?_D.', start: 8, finish: 10, text: 'D.' },
      ],
      'p',
      [ 0, 2, 3, 7, 6, 8 ],
      Gene('root', 'root', [
        TextGene('p', 'D. dd.D.')
      ])
    );
  });

  it('TINY-11560: Valid input produces valid output.', () => {
    checkSubdivide(
      [ 'D.', ' ', 'dd.D', '.' ],
      [
        { id: 'p', start: 0, finish: 2, text: 'D.' },
        { id: '?_ ', start: 2, finish: 3, text: ' ' },
        { id: '?_dd.D', start: 3, finish: 7, text: 'dd.D' },
        { id: '?_.', start: 7, finish: 8, text: '.' },
      ],
      'p',
      [ 0, 2, 3, 7 ],
      Gene('root', 'root', [
        TextGene('p', 'D. dd.D.')
      ])
    );
  });
});
