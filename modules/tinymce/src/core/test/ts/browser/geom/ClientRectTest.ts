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

  it('getOverflow', () => {
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 10, 10, 10)), { x: 0, y: 0 });
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 20, 20), rect(15, 15, 10, 10)), { x: 0, y: 0 });
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(5, 10, 10, 10)), { x: -5, y: 0 });
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 5, 10, 10)), { x: 0, y: -5 });
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(15, 10, 10, 10)), { x: 5, y: 0 });
    assert.deepEqual(ClientRect.getOverflow(rect(10, 10, 10, 10), rect(10, 15, 10, 10)), { x: 0, y: 5 });
  });
});
