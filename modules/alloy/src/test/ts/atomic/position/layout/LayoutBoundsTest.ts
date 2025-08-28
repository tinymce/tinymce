import { describe, it } from '@ephox/bedrock-client';
import { Optionals } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as LayoutBounds from 'ephox/alloy/positioning/layout/LayoutBounds';
import { assertInBounds, boundsArb } from 'ephox/alloy/test/BoundsUtils';

describe('LayoutBoundsTest', () => {
  const dimensions = [ 'left' as const, 'right' as const, 'top' as const, 'bottom' as const ];
  const restrictionArb = boundsArb().chain<LayoutBounds.BoundsRestriction>((anchorBox) =>
    fc.constantFrom(...dimensions).map((dim) => ({
      left: Optionals.someIf(dim === 'left', anchorBox.x),
      right: Optionals.someIf(dim === 'right', anchorBox.right),
      top: Optionals.someIf(dim === 'top', anchorBox.y),
      bottom: Optionals.someIf(dim === 'bottom', anchorBox.bottom)
    }))
  );

  it('TINY-7545: the restricted layout bounds should always be inside the bounds', () => {
    const bubbleArb = fc.integer(-20, 20);
    fc.assert(fc.property(boundsArb(), restrictionArb, bubbleArb, bubbleArb, (bounds, restriction, bubbleLeft, bubbleRight) => {
      const newBounds = LayoutBounds.adjustBounds(bounds, restriction, SugarPosition(bubbleLeft, bubbleRight));
      assertInBounds(newBounds, bounds);
    }));
  });

  it('TINY-7545: the left coord should be the anchor box/bounds plus the bubble offset', () => {
    const bounds = Boxes.bounds(0, 0, 100, 100);
    const inBoundsRestriction = LayoutBounds.boundsRestriction(Boxes.bounds(0, 0, 10, 100), { left: LayoutBounds.AnchorBoxBounds.RightEdge });
    const outBoundsRestriction = LayoutBounds.boundsRestriction(Boxes.bounds(-20, 0, 10, 100), { left: LayoutBounds.AnchorBoxBounds.RightEdge });
    // Note: bubbleLeft needs to be at least 10 less than the bounds width to make sure it fits
    fc.assert(fc.property(fc.integer(0, 90), fc.integer(0, 100), (bubbleLeft, bubbleTop) => {
      const newInBounds = LayoutBounds.adjustBounds(bounds, inBoundsRestriction, SugarPosition(bubbleLeft, bubbleTop));
      assert.equal(newInBounds.x, 10 + bubbleLeft, 'left bounds have been changed');
      assert.equal(newInBounds.right, bounds.right, 'right bounds are unchanged');
      assert.equal(newInBounds.y, bounds.y, 'top bounds are unchanged');
      assert.equal(newInBounds.bottom, bounds.bottom, 'bottom bounds are unchanged');

      const newOutBounds = LayoutBounds.adjustBounds(bounds, outBoundsRestriction, SugarPosition(bubbleLeft, bubbleTop));
      assert.equal(newOutBounds.x, bounds.x + bubbleLeft, 'left bounds have been changed');
      assert.equal(newOutBounds.right, bounds.right, 'right bounds are unchanged');
      assert.equal(newOutBounds.y, bounds.y, 'top bounds are unchanged');
      assert.equal(newOutBounds.bottom, bounds.bottom, 'bottom bounds are unchanged');
    }));
  });

  it('TINY-7545: the bottom coord should be the anchor box/bounds minus the bubble offset', () => {
    const bounds = Boxes.bounds(0, 0, 100, 100);
    const inBoundsRestriction = LayoutBounds.boundsRestriction(Boxes.bounds(0, 80, 100, 50), { bottom: LayoutBounds.AnchorBoxBounds.TopEdge });
    const outBoundsRestriction = LayoutBounds.boundsRestriction(Boxes.bounds(0, 150, 100, 50), { bottom: LayoutBounds.AnchorBoxBounds.TopEdge });
    // Note: bubbleTop needs to between the bounds top (0) and the anchor top (80) coords
    fc.assert(fc.property(fc.integer(0, 100), fc.integer(0, 80), (bubbleLeft, bubbleTop) => {
      const newInBounds = LayoutBounds.adjustBounds(bounds, inBoundsRestriction, SugarPosition(bubbleLeft, -bubbleTop));
      assert.equal(newInBounds.x, bounds.x, 'left bounds are unchanged');
      assert.equal(newInBounds.right, bounds.right, 'right bounds are unchanged');
      assert.equal(newInBounds.y, bounds.y, 'top bounds are unchanged');
      assert.equal(newInBounds.bottom, 80 - bubbleTop, 'bottom bounds have been changed');

      const newOutBounds = LayoutBounds.adjustBounds(bounds, outBoundsRestriction, SugarPosition(bubbleLeft, -bubbleTop));
      assert.equal(newOutBounds.x, bounds.x, 'left bounds are unchanged');
      assert.equal(newOutBounds.right, bounds.right, 'right bounds are unchanged');
      assert.equal(newOutBounds.y, bounds.y, 'top bounds are unchanged');
      assert.equal(newOutBounds.bottom, bounds.bottom - bubbleTop, 'bottom bounds have been changed');
    }));
  });

  it('TINY-7545: Anchor box with bubble that overlaps the edge is constrained to bounds', () => {
    const bounds = Boxes.bounds(0, 0, 100, 100);
    const restriction = LayoutBounds.boundsRestriction(Boxes.bounds(10, 0, 10, 100), { right: LayoutBounds.AnchorBoxBounds.LeftEdge });
    const newBounds = LayoutBounds.adjustBounds(bounds, restriction, SugarPosition(-20, 0));
    assert.equal(newBounds.x, bounds.x, 'left bounds are changed');
    assert.equal(newBounds.right, bounds.x, 'right bounds have been changed and been constrained');
    assert.equal(newBounds.y, bounds.y, 'top bounds are unchanged');
    assert.equal(newBounds.bottom, bounds.bottom, 'bottom bounds are unchanged');
  });
});
