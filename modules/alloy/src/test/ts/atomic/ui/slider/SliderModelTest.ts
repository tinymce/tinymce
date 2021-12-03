import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import * as fc from 'fast-check';

import * as SliderModel from 'ephox/alloy/ui/slider/SliderModel';

interface TestData {
  readonly min: number;
  readonly max: number;
  readonly value: number;
  readonly stepSize: number;
  readonly snapToGrid: boolean;
  readonly rounded: boolean;
  readonly hasLedge: boolean;
  readonly hasRedge: boolean;
}

interface TestBounds {
  readonly left: number;
  readonly width: number;
  readonly right: number;
}

UnitTest.test('Atomic Test: ui.slider.SliderModelTest', () => {
  const arb1Up = fc.nat().map((num) => num + 1);

  const arbRanged = fc.nat().chain((min) => arb1Up.chain((width) => {
    const max = min + width;
    return fc.float({ min: min - 1, max: max + 1 }).map((value) => {
      const v = Math.round(value);

      return {
        min,
        max,
        value: v
      };
    });
  }));

  const arbData = fc.tuple(arbRanged, arb1Up, fc.boolean(), fc.boolean(), fc.boolean()).map(
    (arr: [ { min: number; max: number; value: number }, number, boolean, boolean, boolean ]): TestData => ({
      min: arr[0].min,
      max: arr[0].max,
      value: arr[0].value,
      stepSize: arr[1],
      snapToGrid: arr[2],
      rounded: true, // Difficult to test with this off
      hasLedge: arr[3],
      hasRedge: arr[4]
    })
  );

  const arbBounds = fc.nat().chain((min) => arb1Up.map((width): TestBounds => ({
    left: min,
    width,
    right: min + width
  })));

  // Reducing never goes beyond min-1
  fc.assert(fc.property(arbData, (data) => {
    const newValue = SliderModel.reduceBy(data.value, data.min, data.max, data.stepSize);
    Assert.eq('Checking value', true, newValue <= data.value && newValue >= data.min - 1);
  }));

  // Increasing never goes beyond max+1
  fc.assert(fc.property(arbData, (data) => {
    const newValue = SliderModel.increaseBy(data.value, data.min, data.max, data.stepSize);
    Assert.eq('Checking value', true, newValue >= data.value && newValue <= data.max + 1);
  }));

  // Finding value of snapped always results in a factorable value
  fc.assert(fc.property(arbData, arbBounds, fc.nat(), (data, bounds, xValue) => {
    const args = {
      min: data.min,
      max: data.max,
      range: data.max - data.min,
      value: xValue,
      step: data.stepSize,
      snap: true,
      snapStart: Optional.none<number>(),
      rounded: data.rounded,
      hasMinEdge: data.hasLedge,
      hasMaxEdge: data.hasRedge,
      minBound: bounds.left,
      maxBound: bounds.right,
      screenRange: bounds.width
    };
    const newValue = SliderModel.findValueOf(args);
    const f = Math.abs((newValue - data.min) / data.stepSize);
    const actual = Math.floor(f) === f || newValue === data.min || newValue === data.max || newValue === data.min - 1 || newValue === data.max + 1;
    Assert.eq('Checking factors correctly', true, actual);
  }));

  // Finding value of snapped always results in a factorable value with a snap start
  fc.assert(fc.property(arbData, arbBounds, fc.nat(), fc.nat(), (data, bounds, xValue, snapOffset) => {
    const args = {
      min: data.min,
      max: data.max,
      range: data.max - data.min,
      value: xValue,
      step: data.stepSize,
      snap: true,
      snapStart: Optional.some(snapOffset + data.min),
      rounded: data.rounded,
      hasMinEdge: data.hasLedge,
      hasMaxEdge: data.hasRedge,
      minBound: bounds.left,
      maxBound: bounds.right,
      screenRange: bounds.width
    };
    const newValue = SliderModel.findValueOf(args);
    const f = Math.abs((newValue - (data.min + snapOffset)) / data.stepSize);
    Assert.eq('Checking factors correctly: ' + newValue, true,
      Math.floor(f) === f || newValue === data.min || newValue === data.max || newValue === data.min - 1 || newValue === data.max + 1
    );
  }));

  // Finding value of any value always fits in the [min - 1, max + 1] range
  fc.assert(fc.property(arbData, arbBounds, fc.nat(), (data, bounds, xValue) => {
    const args = {
      min: data.min,
      max: data.max,
      range: data.max - data.min,
      value: xValue,
      step: data.stepSize,
      snap: data.snapToGrid,
      snapStart: Optional.none<number>(),
      rounded: data.rounded,
      hasMinEdge: data.hasLedge,
      hasMaxEdge: data.hasRedge,
      minBound: bounds.left,
      maxBound: bounds.right,
      screenRange: bounds.width
    };
    const newValue = SliderModel.findValueOf(args);
    Assert.eq(
      'Assert within range: ' + newValue, true,
      newValue >= data.min - 1 && newValue <= data.max + 1
    );
  }));

  // Finding value of any value always fits in the [min - 1, max + 1] range with a snap start
  fc.assert(fc.property(arbData, arbBounds, fc.nat(), fc.nat(), (data, bounds, xValue, snapOffset) => {
    const args = {
      min: data.min,
      max: data.max,
      range: data.max - data.min,
      value: xValue,
      step: data.stepSize,
      snap: data.snapToGrid,
      snapStart: Optional.some(snapOffset + data.min <= data.max ? snapOffset + data.min : data.max),
      rounded: data.rounded,
      hasMinEdge: data.hasLedge,
      hasMaxEdge: data.hasRedge,
      minBound: bounds.left,
      maxBound: bounds.right,
      screenRange: bounds.width
    };
    const newValue = SliderModel.findValueOf(args);
    Assert.eq(
      'Assert within range: ' + newValue, true,
      newValue >= data.min - 1 && newValue <= data.max + 1
    );
  }));
});
