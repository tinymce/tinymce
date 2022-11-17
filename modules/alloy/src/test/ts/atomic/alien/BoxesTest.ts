import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';

// TODO: Add more tests.
describe('atomic.alloy.alien.BoxesTest', () => {
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
      const arbBounds: fc.Arbitrary<Boxes.Bounds> = fc.nat(1000).chain((x) =>
        fc.nat(1000).chain((y) =>
          fc.nat(1000).chain((width) =>
            fc.nat(1000).map((height) =>
              Boxes.bounds(x, y, width, height)
            )
          )
        )
      );

      it('basic property - no outside constraints', () => {
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
});
