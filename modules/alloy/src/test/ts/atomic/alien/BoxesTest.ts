import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';

describe('atomic.alloy.alien.BoxesTest', () => {
  const arbBounds: fc.Arbitrary<Boxes.Bounds> =
    fc.tuple(
      fc.nat(1000),
      fc.nat(1000),
      fc.nat(1000),
      fc.nat(1000)
    ).map(([ x, y, width, height ]) =>
      Boxes.bounds(x, y, width, height)
    );

  context('Boxes.constrain', () => {
    it('TINY-9226: Constraint equals box', () => {
      const actual = Boxes.constrain(
        Boxes.bounds(0, 0, 1000, 500),
        Boxes.bounds(0, 0, 1000, 500)
      );

      assert.deepEqual(
        actual,
        Boxes.bounds(0, 0, 1000, 500)
      );
    });

    it('TINY-9226: Constraint larger than box', () => {
      const original = Boxes.bounds(100, 100, 800, 300);
      const constraint = Boxes.bounds(0, 0, 1000, 500);
      const actual = Boxes.constrain(original, constraint);

      assert.deepEqual(
        actual,
        original
      );
    });

    context('Properties', () => {
      it('TINY-9226: basic property - no outside constraints', () => {
        fc.assert(
          fc.property(arbBounds, arbBounds, (original, constraint) => {
            const actual = Boxes.constrain(original, constraint);
            assert.isAtLeast(actual.x, constraint.x);
            assert.isAtMost(actual.right, constraint.right);
            assert.isAtLeast(actual.y, constraint.y);
            assert.isAtMost(actual.bottom, constraint.bottom);
          })
        );
      });
    });
  });

  context('Boxes.constrainByMany', () => {
    it('TINY-9226: Sanity test', () => {
      const actual = Boxes.constrainByMany(
        Boxes.bounds(100, 100, 500, 300),
        [
          Boxes.bounds(50, 50, 350, 200),
          Boxes.bounds(0, 0, 1000, 1000),
          Boxes.bounds(0, 0, 200, 1000)
        ]
      );
      assert.deepEqual(
        actual,
        Boxes.bounds(100, 100, 200 - 100, 250 - 100)
      );
    });

    context('Properties', () => {
      const sortNumbers = (xs: number[]): number[] => {
        return Arr.sort(xs, (a, b) => {
          if (a < b) {
            return -1;
          } else if (b < a) {
            return +1;
          } else {
            return 0;
          }
        });
      };

      it('TINY-9226: no constrants', () => {
        fc.assert(
          fc.property(arbBounds, (original) => {
            const actual = Boxes.constrainByMany(original, [ ]);
            assert.deepEqual(actual, original);
          })
        );
      });
      it('TINY-9226: basic property', () => {
        fc.assert(
          fc.property(arbBounds, arbBounds, fc.array(arbBounds), (original, first, rest) => {
            const constraints = [ first ].concat(rest);
            const all = [ original ].concat(constraints);
            const actual = Boxes.constrainByMany(original, constraints);
            const optLargestLeft = Arr.last(sortNumbers(Arr.map(all, (c) => c.x)));
            const optLargestTop = Arr.last(sortNumbers(Arr.map(all, (c) => c.y)));
            const optSmallestRight = Arr.head(sortNumbers(Arr.map(all, (c) => c.right)));
            const optSmallestBottom = Arr.head(sortNumbers(Arr.map(all, (c) => c.bottom)));

            const assertOpt = (label: string, optValue: Optional<number>, actualValue: number): void => {
              optValue.fold(
                () => assert.fail('There were no candidates. Actual value: ' + actualValue),
                (v) => assert.equal(
                  actualValue,
                  v,
                  `Property ${label}. Expected: ${v}, Actual: ${actualValue}, \n
                   All: ${JSON.stringify(all, null, 2)}`
                )
              );
            };

            assertOpt('left', optLargestLeft, actual.x);
            assertOpt('right', optSmallestRight, actual.right);
            assertOpt('top', optLargestTop, actual.y);
            assertOpt('bottom', optSmallestBottom, actual.bottom);
          })
        );
      });
    });
  });
});
