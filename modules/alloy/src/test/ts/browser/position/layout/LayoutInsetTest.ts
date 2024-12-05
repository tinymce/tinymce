import { context, describe, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import * as fc from 'fast-check';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Bubble from 'ephox/alloy/positioning/layout/Bubble';
import * as LayoutInset from 'ephox/alloy/positioning/layout/LayoutInset';
import { Placement, setPlacement } from 'ephox/alloy/positioning/layout/Placement';
import { boxArb, boundsArb } from 'ephox/alloy/test/BoundsUtils';

describe('LayoutInsetTest', () => {
  const placements = [
    Placement.North, Placement.South, Placement.Northeast, Placement.Southeast,
    Placement.Northwest, Placement.Southwest, Placement.East, Placement.West
  ];

  context('preserve', () => {
    it('TINY-7545: the new layout placement should always match the previous placement', () => {
      const element = SugarElement.fromTag('div');
      fc.assert(fc.property(boxArb(), fc.constantFrom(...placements), boundsArb(), (box, placement, bounds) => {
        setPlacement(element, placement);
        const newLayout = LayoutInset.preserve(box, { width: 10, height: 10 }, Bubble.fallback(), element, bounds);
        assert.equal(newLayout.placement, placement);
      }));
    });

    it('TINY-7545: falls back to north if no previous placement is found', () => {
      const element = SugarElement.fromTag('div');
      const newLayout = LayoutInset.preserve(Boxes.bounds(0, 0, 50, 50), { width: 10, height: 10 }, Bubble.fallback(), element, Boxes.win());
      assert.equal(newLayout.placement, Placement.North);
    });
  });

  context('flip', () => {
    const getExpectedFlippedPlacement = (placement: Placement) => {
      // South -> North
      if (Strings.startsWith(placement, 'south')) {
        return placement.replace('south', 'north');
      // North -> South
      } else if (Strings.startsWith(placement, 'north')) {
        return placement.replace('north', 'south');
      // East -> West
      } else if (Strings.startsWith(placement, 'east')) {
        return placement.replace('east', 'west');
      // West -> East
      } else {
        return placement.replace('west', 'east');
      }
    };

    it('TINY-7192: the new layout placement should be on the opposite axis to the current placement', () => {
      const element = SugarElement.fromTag('div');
      fc.assert(fc.property(boxArb(), fc.constantFrom(...placements), boundsArb(), (box, placement, bounds) => {
        setPlacement(element, placement);
        const newLayout = LayoutInset.flip(box, { width: 10, height: 10 }, Bubble.fallback(), element, bounds);
        const expectedLayout = getExpectedFlippedPlacement(placement);
        assert.equal(newLayout.placement, expectedLayout);
      }));
    });

    it('TINY-7192: falls back to north if no previous placement is found', () => {
      const element = SugarElement.fromTag('div');
      const newLayout = LayoutInset.flip(Boxes.bounds(0, 0, 50, 50), { width: 10, height: 10 }, Bubble.fallback(), element, Boxes.win());
      assert.equal(newLayout.placement, Placement.North);
    });

    it('TINY-11549: when the boundaries are smaller than the anchor element, the position should respect the middle of the boundaries and not the anchor element', () => {
      const achorElem = Boxes.bounds(0, 0, 500, 100);
      const element = { width: 200, height: 50 };
      const placee = SugarElement.fromTag('div');

      const newLayoutWithBiggerBoudariesNorth = LayoutInset.north(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 200));
      assert.equal(newLayoutWithBiggerBoudariesNorth.x, 150);

      const newLayoutWithSmallerBoundariesNorth = LayoutInset.north(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 300, 200));
      assert.equal(newLayoutWithSmallerBoundariesNorth.x, 50);

      const newLayoutWithBiggerBoudariesSouth = LayoutInset.south(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 200));
      assert.equal(newLayoutWithBiggerBoudariesSouth.x, 150);

      const newLayoutWithSmallerBoundariesSouth = LayoutInset.south(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 300, 200));
      assert.equal(newLayoutWithSmallerBoundariesSouth.x, 50);

      const newLayoutWithBiggerBoudariesWest = LayoutInset.west(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 2000));
      assert.equal(newLayoutWithBiggerBoudariesWest.y, 25);

      const newLayoutWithSmallerBoudariesWest = LayoutInset.west(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 80));
      assert.equal(newLayoutWithSmallerBoudariesWest.y, 15);

      const newLayoutWithBiggerBoudariesEast = LayoutInset.east(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 2000));
      assert.equal(newLayoutWithBiggerBoudariesEast.y, 25);

      const newLayoutWithSmallerBoudariesEast = LayoutInset.east(achorElem, element, Bubble.fallback(), placee, Boxes.bounds(0, 0, 1500, 80));
      assert.equal(newLayoutWithSmallerBoudariesEast.y, 15);
    });
  });
});
