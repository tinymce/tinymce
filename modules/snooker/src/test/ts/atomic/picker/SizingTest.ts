import * as Structs from 'ephox/snooker/api/Structs';
import { Sizing, SizingSettings } from 'ephox/snooker/picker/Sizing';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('SizingTest', function () {
  const check = function (selRow: number, selCol: number, fullRow: number, fullCol: number, address: Structs.Address, settings: SizingSettings) {
    const actual = Sizing.resize(address, settings);
    assert.eq(selRow, actual.selection().row());
    assert.eq(selCol, actual.selection().column());
    assert.eq(fullRow, actual.full().row());
    assert.eq(fullCol, actual.full().column());
  };

  check(1, 1, 2, 2, Structs.address(0, 0), { minCols: 1, maxCols: 5, minRows: 1, maxRows: 5 });
});
