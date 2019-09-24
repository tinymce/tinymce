import { UnitTest } from '@ephox/bedrock';
import Jsc from '@ephox/wrap-jsverify';

import { bounds as makeBounds } from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

UnitTest.test('BounderCalcRepositionTest', () => {

  const nonZeroArb = Jsc.integer(10, 1000);
  const zeroableArb = Jsc.integer(0, 1000);

  const arbTestCase = Jsc.bless({
    generator: zeroableArb.generator.flatMap((newX) => {
      return zeroableArb.generator.flatMap((newY) => {
        return nonZeroArb.generator.flatMap((width) => {
          return nonZeroArb.generator.flatMap((height) => {
            return zeroableArb.generator.flatMap((boundsX) => {
              return zeroableArb.generator.flatMap((boundsY) => {
                return zeroableArb.generator.flatMap((boundsW) => {
                  return zeroableArb.generator.map((boundsH) => {
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
    (input) => {
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
