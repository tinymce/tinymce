import { Gene } from '@ephox/boss';
import { TestUniverse } from '@ephox/boss';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import * as Walker from 'ephox/phoenix/gather/Walker';
import { Walkers } from 'ephox/phoenix/gather/Walkers';
import * as Finder from 'ephox/phoenix/test/Finder';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('WalkerPathTest', function() {
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
          Gene('3.2.2', 'node', []),
        ]),
        Gene('3.3', 'node', [])
      ])
    ])
  );

  const checkPath = function (expected, id, direction) {
    const start = Finder.get(universe, id);
    let path = [];
    let current = Option.some({ item: Fun.constant(start), mode: Fun.constant(Walker.advance) });
    while (current.isSome()) {
      const c = current.getOrDie();
      path = path.concat(c.item().id);
      current = Walker.go(universe, c.item(), c.mode(), direction);
    }

    assert.eq(expected, path);
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

