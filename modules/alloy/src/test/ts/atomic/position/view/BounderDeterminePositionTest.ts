import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Boxes from 'ephox/alloy/alien/Boxes';
import * as Bounder from 'ephox/alloy/positioning/view/Bounder';

describe('BounderDeterminePositionTest', () => {
  it('TINY-7545: inside the bounds', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(50, 50, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isTrue(output.originInBounds, 'Origin in bounds');
    assert.isTrue(output.sizeInBounds, 'Size in bounds');
    assert.equal(output.visibleW, 50, 'Visible width');
    assert.equal(output.visibleH, 100, 'Visible height');
  });

  it('TINY-7545: origin inside the bounds, but size is not', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(150, 150, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isTrue(output.originInBounds, 'Origin in bounds');
    assert.isFalse(output.sizeInBounds, 'Size not in bounds');
    assert.equal(output.visibleW, 50, 'Visible width');
    assert.equal(output.visibleH, 50, 'Visible height');
  });

  it('TINY-7545: size inside the bounds, but origin is not', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(-25, -25, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isFalse(output.originInBounds, 'Origin not in bounds');
    assert.isTrue(output.sizeInBounds, 'Size in bounds');
    assert.equal(output.visibleW, 25, 'Visible width');
    assert.equal(output.visibleH, 75, 'Visible height');
  });

  it('TINY-7545: out of bounds above', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(50, -150, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isFalse(output.originInBounds, 'Origin not in bounds');
    assert.isFalse(output.sizeInBounds, 'Size not in bounds');
    assert.equal(output.visibleW, 50, 'Visible width');
    assert.equal(output.visibleH, -50, 'Visible height');
  });

  it('TINY-7545: out of bounds below', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(50, 250, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isFalse(output.originInBounds, 'Origin not in bounds');
    assert.isFalse(output.sizeInBounds, 'Size not in bounds');
    assert.equal(output.visibleW, 50, 'Visible width');
    assert.equal(output.visibleH, -50, 'Visible height');
  });

  it('out of bounds to the left', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(-100, 50, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isFalse(output.originInBounds, 'Origin not in bounds');
    assert.isFalse(output.sizeInBounds, 'Size not in bounds');
    assert.equal(output.visibleW, -50, 'Visible width');
    assert.equal(output.visibleH, 100, 'Visible height');
  });

  it('out of bounds to the right', () => {
    const bounds = Boxes.bounds(0, 0, 200, 200);
    const box = Boxes.bounds(250, 50, 50, 100);
    const output = Bounder.determinePosition(box, bounds);
    assert.isFalse(output.originInBounds, 'Origin not in bounds');
    assert.isFalse(output.sizeInBounds, 'Size not in bounds');
    assert.equal(output.visibleW, -50, 'Visible width');
    assert.equal(output.visibleH, 100, 'Visible height');
  });
});
