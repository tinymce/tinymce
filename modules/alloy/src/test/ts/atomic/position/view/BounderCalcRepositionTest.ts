import { UnitTest } from '@ephox/bedrock-client';
import Jsc from '@ephox/wrap-jsverify';

import { bounds as makeBounds } from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

UnitTest.test('BounderCalcRepositionTest', () => {

  const maxBounds = 2000;
  const minBounds  = 0;
  const zeroableArb = Jsc.integer(minBounds, maxBounds);

  const arbTestCase = Jsc.bless({
    generator: zeroableArb.generator.flatMap((boundsX: number) => {
      return zeroableArb.generator.flatMap((boundsY: number) => {
        return Jsc.integer(boundsX, maxBounds).generator.flatMap((newX: number) => {
          return Jsc.integer(boundsY, maxBounds).generator.flatMap((newY: number) => {
            return zeroableArb.generator.flatMap((width: number) => {
              return zeroableArb.generator.flatMap((height: number) => {
                return Jsc.integer(newX + width, maxBounds).generator.flatMap((boundsW: number) => {
                  return Jsc.integer(newY + height, maxBounds).generator.map((boundsH: number) => {
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

      const xIsVisible = output.limitX <= (bounds.right() - input.width) && output.limitX >= bounds.x();
      const yIsVisible = output.limitY <= (bounds.bottom() - input.height) && output.limitY >= bounds.y();
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
