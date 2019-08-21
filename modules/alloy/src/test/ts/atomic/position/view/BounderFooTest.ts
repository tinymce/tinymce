import { UnitTest } from '@ephox/bedrock';

import { bounds as makeBounds } from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

import Jsc from '@ephox/wrap-jsverify';

UnitTest.test('BounderCursorTest', () => {

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
      const output = Bounder.attemptFoo(input.newX, input.newY, input.width, input.height, bounds);

      // const xIsVisible = output.limitX < bounds.right() && (output.limitX + input.width) > bounds.x();
      const yIsVisible = output.limitY < bounds.bottom() && (output.limitY + input.height) > bounds.y();
      // if (! xIsVisible) {
      //   return 'X is not inside bounds';
      // } else if (! yIsVisible) {
      if (! yIsVisible) {
        return 'Y is not inside bounds. Returned: ' + JSON.stringify(output);
      } else {
        return true;
      }
    }
  );

  // const check = (expected, newX, newY, width, height, bounds) => {
  //   Jsc.

  //   RawAssertions.assertEq(
  //     'Checking attemptFoo',
  //     expected,
  //     Bounder.attemptFoo(newX, newY, width, height, bounds)
  //   );
  // };

  // check(
  //   {
  //     limitX: 1,
  //     limitY: 20,
  //     deltaW: 20,
  //     deltaH: 10,
  //     originInBounds: true,
  //     sizeInBounds: true
  //   },
  //   100,
  //   100,
  //   50,
  //   50,
  //   makeBounds(10, 10, 200, 200)
  // );
});
