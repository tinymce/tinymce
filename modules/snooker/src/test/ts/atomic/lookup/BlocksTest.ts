import Structs from 'ephox/snooker/api/Structs';
import Blocks from 'ephox/snooker/lookup/Blocks';
import Warehouse from 'ephox/snooker/model/Warehouse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('BlocksTest', function () {
  const s = Structs.detail;
  const f = Structs.rowdata;
  const warehouse = Warehouse.generate([
    f('r1', [ s('a', 1, 1), s('b', 1, 2) ], 'thead'),
    f('r2', [ s('c', 2, 1), s('d', 1, 1), s('e', 1, 1) ], 'tbody'),
    f('r2', [ s('f', 1, 1), s('g', 1, 1) ], 'tbody'),
    f('r3', [ s('h', 1, 1), s('i', 1, 2) ], 'tfoot')
  ]);

  assert.eq(['a', 'd', 'e'], Blocks.columns(warehouse).map(function (c) { return c.getOrDie(); }));
});
