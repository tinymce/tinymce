import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ClientRect from 'tinymce/core/geom/ClientRect';

describe('browser.tinymce.core.geom.ClientRectTest', () => {
  const rect = (x: number, y: number, w: number, h: number) => {
    return {
      left: x,
      top: y,
      bottom: y + h,
      right: x + w,
      width: w,
      height: h
    };
  };

  it('clone', () => {
    assert.deepEqual(ClientRect.clone(rect(10, 20, 30, 40)), rect(10, 20, 30, 40));
    assert.deepEqual(ClientRect.clone(rect(10.1, 20.1, 30.1, 40.1)), rect(10, 20, 30, 40));
  });

  it('collapse', () => {
    assert.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), true), rect(10, 20, 0, 40));
    assert.deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), false), rect(40, 20, 0, 40));
  });

  it('isAbove', () => {
    assert.isFalse(ClientRect.isAbove(rect(10, 70, 10, 40), rect(20, 40, 10, 20)));
    assert.isTrue(ClientRect.isAbove(rect(10, 40, 10, 20), rect(20, 70, 10, 40)));
  });

  it('isAbove intersects', () => {
    assert.isFalse(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 10)));
    assert.isFalse(ClientRect.isAbove(rect(10, 20, 10, 40), rect(20, 20, 10, 10)));
    assert.isFalse(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 40)));
    assert.isFalse(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 15, 10, 10)));
    assert.isFalse(ClientRect.isAbove(rect(10, 15, 10, 10), rect(20, 20, 10, 10)));
    assert.isFalse(ClientRect.isAbove(rect(10, 10, 10, 40), rect(20, 40, 10, 10)));
    assert.isTrue(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 20, 10, 10)));
    assert.isTrue(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 16, 10, 10)));
  });

  it('isBelow', () => {
    assert.isTrue(ClientRect.isBelow(rect(10, 70, 10, 40), rect(20, 40, 10, 20)));
    assert.isFalse(ClientRect.isBelow(rect(10, 40, 10, 20), rect(20, 70, 10, 40)));
  });

  it('isBelow intersects', () => {
    assert.isTrue(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 20)));
    assert.isTrue(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 25)));
    assert.isFalse(ClientRect.isBelow(rect(10, 15, 10, 20), rect(20, 30, 10, 20)));
    assert.isFalse(ClientRect.isBelow(rect(10, 29, 10, 20), rect(20, 10, 10, 30)));
    assert.isTrue(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 30)));
    assert.isFalse(ClientRect.isBelow(rect(10, 20, 10, 20), rect(20, 10, 10, 30)));
  });

  it('isLeft', () => {
    assert.isTrue(ClientRect.isLeft(rect(10, 20, 30, 40), rect(20, 20, 30, 40)));
    assert.isFalse(ClientRect.isLeft(rect(20, 20, 30, 40), rect(10, 20, 30, 40)));
  });

  it('isRight', () => {
    assert.isFalse(ClientRect.isRight(rect(10, 20, 30, 40), rect(20, 20, 30, 40)));
    assert.isTrue(ClientRect.isRight(rect(20, 20, 30, 40), rect(10, 20, 30, 40)));
  });

  it('compare', () => {
    assert.equal(ClientRect.compare(rect(10, 70, 10, 40), rect(10, 40, 10, 20)), 1);
    assert.equal(ClientRect.compare(rect(10, 40, 10, 20), rect(10, 70, 10, 40)), -1);
    assert.equal(ClientRect.compare(rect(5, 10, 10, 10), rect(10, 10, 10, 10)), -1);
    assert.equal(ClientRect.compare(rect(15, 10, 10, 10), rect(10, 10, 10, 10)), 1);
  });

  it('containsXY', () => {
    assert.isFalse(ClientRect.containsXY(rect(10, 70, 10, 40), 1, 2));
    assert.isFalse(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 2));
    assert.isFalse(ClientRect.containsXY(rect(10, 70, 10, 40), 25, 2));
    assert.isTrue(ClientRect.containsXY(rect(10, 70, 10, 40), 10, 70));
    assert.isTrue(ClientRect.containsXY(rect(10, 70, 10, 40), 20, 110));
    assert.isTrue(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 75));
  });

  it('overlapX', () => {
    assert.equal(ClientRect.overlapX(rect(10, 10, 20, 30), rect(10, 10, 20, 30)), 20, 'overlaps 100%');
    assert.equal(ClientRect.overlapX(rect(10, 10, 20, 30), rect(10, 10, 30, 30)), 20, 'r1 overlaps r2 by 20 pixels');
    assert.equal(ClientRect.overlapX(rect(10, 10, 30, 30), rect(10, 10, 20, 30)), 20, 'r2 overlaps r1 by 20 pixels');
    assert.equal(ClientRect.overlapX(rect(10, 10, 20, 30), rect(15, 10, 20, 30)), 15, 'r1 overlaps r2 by 15 pixels');
    assert.equal(ClientRect.overlapX(rect(15, 10, 20, 30), rect(10, 10, 20, 30)), 15, 'r2 overlaps r1 by 15 pixels');
    assert.equal(ClientRect.overlapX(rect(10, 10, 20, 30), rect(30, 10, 20, 30)), 0, 'no overlap');
  });

  it('overlapY', () => {
    assert.equal(ClientRect.overlapY(rect(10, 10, 20, 30), rect(10, 10, 20, 30)), 30, 'overlaps 100%');
    assert.equal(ClientRect.overlapY(rect(10, 10, 30, 20), rect(10, 10, 30, 30)), 20, 'r1 overlaps r2 by 20 pixels');
    assert.equal(ClientRect.overlapY(rect(10, 10, 30, 30), rect(10, 10, 30, 20)), 20, 'r2 overlaps r1 by 20 pixels');
    assert.equal(ClientRect.overlapY(rect(10, 10, 20, 30), rect(10, 15, 20, 30)), 25, 'r1 overlaps r2 by 25 pixels');
    assert.equal(ClientRect.overlapY(rect(10, 15, 20, 30), rect(10, 10, 20, 30)), 25, 'r2 overlaps r1 by 25 pixels');
    assert.equal(ClientRect.overlapY(rect(10, 10, 20, 30), rect(10, 40, 20, 30)), 0, 'no overlap');
  });

  it('boundingClientRectFromRects', () => {
    assert.isTrue(ClientRect.boundingClientRectFromRects([]).isNone(), 'no rects no bounding rect');
    assert.deepEqual(ClientRect.boundingClientRectFromRects([ rect(11, 12, 13, 14) ]).getOrDie(), rect(11, 12, 13, 14), 'should be the same rect');
    assert.deepEqual(ClientRect.boundingClientRectFromRects([ rect(10, 10, 10, 10), rect(30, 30, 10, 10) ]).getOrDie(), rect(10, 10, 30, 30), 'expand bottom right');
    assert.deepEqual(ClientRect.boundingClientRectFromRects([ rect(10, 10, 10, 10), rect(5, 5, 10, 10) ]).getOrDie(), rect(5, 5, 15, 15), 'expand top left');
    assert.deepEqual(ClientRect.boundingClientRectFromRects([ rect(10, 10, 10, 10), rect(5, 5, 10, 10), rect(30, 30, 10, 10) ]).getOrDie(), rect(5, 5, 35, 35), 'expand all directions');
  });

  it('distanceToRectEdgeFromXY', () => {
    assert.equal(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 15, 15), 0, 'should be 0 when point is inside rect');
    assert.equal(Math.round(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 0, 0)), 14, 'should be the distance at a 45 degree angle');
    assert.equal(Math.round(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 15, 5)), 5, 'above and closer to the top');
    assert.equal(Math.round(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 5, 15)), 5, 'left and closer to the left');
    assert.equal(Math.round(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 15, 35)), 5, 'below and closer to the below');
    assert.equal(Math.round(ClientRect.distanceToRectEdgeFromXY(rect(10, 10, 20, 20), 35, 15)), 5, 'right and closer to the right');
  });
});
