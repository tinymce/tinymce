import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';
import { assertInBounds, boundsArb, boxAndBoundsArb, boxArb } from 'ephox/alloy/test/BoundsUtils';

describe('BounderCalcRepositionTest', () => {
  it('TINY-4586: the repositioned box should always be within the bounds', () => {
    fc.assert(fc.property(boxAndBoundsArb(-2000, 2000), ({ bounds, box }) => {
      const output = Bounder.calcReposition(box, bounds);
      assertInBounds(output, bounds);
    }));
  });

  it('TINY-7545: a box inside the bounds should be the same size', () => {
    const bounds = Boxes.bounds(-200, -200, 400, 400);
    fc.assert(fc.property(boxArb(-199, 199), (box) => {
      const output = Bounder.calcReposition(box, bounds);
      assert.deepEqual(output, box);
    }));
  });

  it('TINY-7545: a box outside the bounds should be shrunk to the size of the bounds', () => {
    const box = Boxes.bounds(0, 0, 400, 400);
    fc.assert(fc.property(boundsArb(50, 350), (bounds) => {
      const output = Bounder.calcReposition(box, bounds);
      assert.deepEqual(output, bounds);
    }));
  });
});
