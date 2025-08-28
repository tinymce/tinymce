import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';

const boundsArb = (minBounds = 0, maxBounds = 2000): fc.Arbitrary<Boxes.Bounds> => {
  const zeroableArb = fc.integer(minBounds, maxBounds);

  return zeroableArb.chain((boundsX) =>
    zeroableArb.chain((boundsY) =>
      fc.integer(boundsX, maxBounds).chain((boundsRight) =>
        fc.integer(boundsY, maxBounds).map((boundsBottom) =>
          Boxes.bounds(boundsX, boundsY, boundsRight - boundsX, boundsBottom - boundsY)
        )
      )
    )
  );
};

const boxArb = boundsArb;

const boxAndBoundsArb = (minBounds = 0, maxBounds = 2000): fc.Arbitrary<{ box: Boxes.Bounds; bounds: Boxes.Bounds }> =>
  boundsArb(minBounds, maxBounds).chain((bounds) =>
    boxArb(minBounds, maxBounds).map((box) => ({
      box,
      bounds
    }))
  );

const assertInBounds = (box: Boxes.Bounds, bounds: Boxes.Bounds): void => {
  const outputString = JSON.stringify(box);
  assert.isAtLeast(box.x, bounds.x, 'X is not inside bounds. Returned: ' + outputString);
  assert.isAtMost(box.right, bounds.right, 'X is not inside bounds. Returned: ' + outputString);
  assert.isAtLeast(box.y, bounds.y, 'Y is not inside bounds. Returned: ' + outputString);
  assert.isAtMost(box.bottom, bounds.bottom, 'Y is not inside bounds. Returned: ' + outputString);
};

export {
  assertInBounds,
  boxArb,
  boundsArb,
  boxAndBoundsArb
};
