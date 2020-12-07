import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';
import Jsc from '@ephox/wrap-jsverify';

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

    return Jsc.eq(expected.left, actual.left) &&
      Jsc.eq(expected.top, actual.top) ? true : comparing;
  };

  const arbConversions = Jsc.elements([
    { asPoint: DragCoord.asFixed, nu: DragCoord.fixed, mode: 'fixed' },
    { asPoint: DragCoord.asAbsolute, nu: DragCoord.absolute, mode: 'absolute' },
    { asPoint: DragCoord.asOffset, nu: DragCoord.offset, mode: 'offset' }
  ]);

  const arbPosition = (name: string) =>
    Jsc.tuple([ Jsc.integer, Jsc.integer ])
      .smap(
        (arr: [ number, number ]) => SugarPosition(arr[0], arr[1]),
        (pos: SugarPosition) => [ pos.left, pos.top ],
        (pos: SugarPosition) => name + ': { left: ' + pos.left + ', top: ' + pos.top + '}'
      );

  Jsc.property(
    'round-tripping coordinates',
    arbConversions,
    Jsc.array(arbConversions),
    arbPosition('point'),
    arbPosition('scroll'),
    arbPosition('origin'),
    (
      original: TestConversion,
      transformations: TestConversion[],
      coord: SugarPosition,
      scroll: SugarPosition,
      origin: SugarPosition
    ) => {
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
  );
});
