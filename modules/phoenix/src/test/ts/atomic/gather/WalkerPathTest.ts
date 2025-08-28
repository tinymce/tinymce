import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse } from '@ephox/boss';
import { Optional } from '@ephox/katamari';

import { Direction, Traverse } from 'ephox/phoenix/api/data/Types';
import * as Walker from 'ephox/phoenix/gather/Walker';
import { Walkers } from 'ephox/phoenix/gather/Walkers';
import * as Finder from 'ephox/phoenix/test/Finder';

UnitTest.test('WalkerPathTest', () => {
  const universe = TestUniverse(
    Gene('root', 'root', [
      Gene('1', 'node', [
        Gene('1.1', 'node', [
          Gene('1.1.1', 'node', [])
        ]),
        Gene('1.2', 'node', [
          Gene('1.2.1', 'node', [
            Gene('1.2.1.1', 'node', []),
            Gene('1.2.1.2', 'node', [])
          ])
        ]),
        Gene('1.3', 'node', [])
      ]),
      Gene('2', 'node', [
        Gene('2.1', 'node', []),
        Gene('2.2', 'node', [
          Gene('2.2.1', 'node', []),
          Gene('2.2.2', 'node', [])
        ])
      ]),
      Gene('3', 'node', [
        Gene('3.1', 'node', []),
        Gene('3.2', 'node', [
          Gene('3.2.1', 'node', [
            Gene('3.2.1.1', 'node', []),
            Gene('3.2.1.2', 'node', [])
          ]),
          Gene('3.2.2', 'node', [])
        ]),
        Gene('3.3', 'node', [])
      ])
    ])
  );

  const checkPath = (expected: string[], id: string, direction: Direction) => {
    const start = Finder.get(universe, id);
    let path: string[] = [];
    let current: Optional<Traverse<Gene>> = Optional.some({ item: start, mode: Walker.advance });
    while (current.isSome()) {
      const c = current.getOrDie();
      path = path.concat(c.item.id);
      current = Walker.go(universe, c.item, c.mode, direction);
    }

    Assert.eq('', expected, path);
  };

  checkPath([
    '3.1', '3', '2', '2.2', '2.2.2', '2.2.1', '2.2', '2.1', '2', '1', '1.3', '1.2', '1.2.1', '1.2.1.2', '1.2.1.1',
    '1.2.1', '1.2', '1.1', '1.1.1', '1.1', '1', 'root'
  ], '3.1', Walkers.left());

  checkPath([
    '1.2', '1.2.1', '1.2.1.1', '1.2.1.2', '1.2.1', '1.2', '1.3', '1', '2', '2.1', '2.2', '2.2.1', '2.2.2', '2.2', '2', '3',
    '3.1', '3.2', '3.2.1', '3.2.1.1', '3.2.1.2', '3.2.1', '3.2.2', '3.2', '3.3', '3', 'root'
  ], '1.2', Walkers.right());
});
