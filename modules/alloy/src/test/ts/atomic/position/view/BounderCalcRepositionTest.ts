import { UnitTest } from '@ephox/bedrock-client';
import Jsc from '@ephox/wrap-jsverify';

import { bounds as makeBounds } from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

UnitTest.test('BounderCalcRepositionTest', () => {

  const nonZeroArb = Jsc.integer(10, 1000);
  const zeroableArb = Jsc.integer(0, 1000);

  const arbTestCase = Jsc.bless({
    generator: zeroableArb.generator.flatMap((newX: number) => {
      return zeroableArb.generator.flatMap((newY: number) => {
        return nonZeroArb.generator.flatMap((width: number) => {
          return nonZeroArb.generator.flatMap((height: number) => {
            return zeroableArb.generator.flatMap((boundsX: number) => {
              return zeroableArb.generator.flatMap((boundsY: number) => {
                return zeroableArb.generator.flatMap((boundsW: number) => {
                  return zeroableArb.generator.map((boundsH: number) => {
                    return {
                      newX,
                      newY,
                      width,
                      height,
                      boundsX,
                      boundsY,
                      boundsW,
                      boundsH
                    };
                  });
                });
              });
            });
          });
        });
      });
    })
  });

  Jsc.property(
    'Check that all values have something visible within bounds',
    arbTestCase,
    (input: { newX: number, newY: number, width: number, height: number, boundsX: number, boundsY: number, boundsW: number, boundsH: number}) => {
      const bounds = makeBounds(input.boundsX, input.boundsY, input.boundsW, input.boundsH);
      const output = Bounder.calcReposition(input.newX, input.newY, input.width, input.height, bounds);

      const xIsVisible = output.limitX <= bounds.right() && output.limitX >= bounds.x();
      const yIsVisible = output.limitY <= bounds.bottom() && output.limitY >= bounds.y();
      if (!xIsVisible) {
        return 'X is not inside bounds. Returned: ' + JSON.stringify(output);
      } else if (!yIsVisible) {
        return 'Y is not inside bounds. Returned: ' + JSON.stringify(output);
      } else {
        return true;
      }
    }
  );
});
