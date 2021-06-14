import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import * as LayoutInside from 'ephox/alloy/positioning/layout/LayoutInside';
import { Placement, setPlacement } from 'ephox/alloy/positioning/layout/Placement';
import { boxArb } from 'ephox/alloy/test/BoundsUtils';

describe('LayoutInsidePreserveTest', () => {
  const placements = [
    Placement.North, Placement.South, Placement.Northeast, Placement.Southeast,
    Placement.Northwest, Placement.Southwest, Placement.East, Placement.West
  ];

  it('TINY-7545: the new layout placement should always match the previous placement', () => {
    const element = SugarElement.fromTag('div');
    fc.assert(fc.property(boxArb(), fc.constantFrom(...placements), (box, placement) => {
      setPlacement(element, placement);
      const newLayout = LayoutInside.preserve(box, { width: 10, height: 10 }, Bubble.fallback(), element);
      assert.equal(newLayout.placement, placement);
    }));
  });

  it('TINY-7545: falls back to north if no previous placement is found', () => {
    const element = SugarElement.fromTag('div');
    const newLayout = LayoutInside.preserve(Boxes.bounds(0, 0, 50, 50), { width: 10, height: 10 }, Bubble.fallback(), element);
    assert.equal(newLayout.placement, Placement.North);
  });
});
