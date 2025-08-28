import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as DragCoord from 'ephox/alloy/api/data/DragCoord';

interface TestConversion {
  mode: string;
  nu: (x: number, y: number) => DragCoord.CoordAdt<number>;
  asPoint: (coord: DragCoord.CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition) => SugarPosition;
}

UnitTest.test('DragCoordTest', () => {
  const assertPt = (label: string, expected: SugarPosition, actual: SugarPosition) => {
    const comparing = label + '\nCoordinate Expected: (' + expected.left + ', ' + expected.top + ')' +
      '\nCoordinate Actual: (' + actual.left + ', ' + actual.top + ')';

    assert.equal(actual.left, expected.left, comparing);
    assert.equal(actual.top, expected.top, comparing);
  };

  const arbConversions = fc.constantFrom<TestConversion>(
    { asPoint: DragCoord.asFixed, nu: DragCoord.fixed, mode: 'fixed' },
    { asPoint: DragCoord.asAbsolute, nu: DragCoord.absolute, mode: 'absolute' },
    { asPoint: DragCoord.asOffset, nu: DragCoord.offset, mode: 'offset' }
  );

  const arbPosition = fc.tuple(fc.integer(), fc.integer()).map((arr: [ number, number ]) => SugarPosition(arr[0], arr[1]));

  fc.assert(fc.property(arbConversions, fc.array(arbConversions), arbPosition, arbPosition, arbPosition,
    (original, transformations, coord, scroll, origin) => {
      const o = original.nu(coord.left, coord.top);

      const label = [ original.mode ].concat(Arr.map(transformations, (t) => t.mode));

      const result = Arr.foldl(transformations, (b, transformation) => {
        const pt = transformation.asPoint(b, scroll, origin);
        return transformation.nu(pt.left, pt.top);
      }, o);

      const output = original.asPoint(result, scroll, origin);
      return assertPt(
        '\n' + label,
        coord,
        output
      );
    }
  ));
});
