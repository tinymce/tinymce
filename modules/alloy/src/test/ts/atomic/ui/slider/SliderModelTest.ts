import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import * as SliderModel from 'ephox/alloy/ui/slider/SliderModel';

interface TestData {
  min: number;
  max: number;
  value: number;
  stepSize: number;
  snapToGrid: boolean;
  rounded: boolean;
  hasLedge: boolean;
  hasRedge: boolean;
}

interface TestBounds {
  left: number;
  width: number;
  right: number;
}

UnitTest.test('Atomic Test: ui.slider.SliderModelTest', () => {
  const arb1Up = Jsc.nat.smap((num: number) => num + 1, (num: number) => num - 1);

  const arbRanged = Jsc.bless({
    generator: Jsc.nat.generator.flatMap((min: number) => {
      return arb1Up.generator.flatMap((width: number) => {
        const max = min + width;
        return Jsc.number(min - 1, max + 1).generator.map((value: number) => {
          const v = Math.round(value);

          return {
            min,
            max,
            value: v
          };
        });
      });
    })
  });

  const arbData = Jsc.tuple([arbRanged, arb1Up, Jsc.bool, Jsc.bool, Jsc.bool]).smap(
    (arr: [ { min: number; max: number; value: number }, number, boolean, boolean, boolean ]) => {
      return {
        min: arr[0].min,
        max: arr[0].max,
        value: arr[0].value,
        stepSize: arr[1],
        snapToGrid: arr[2],
        rounded: true, // Difficult to test with this off
        hasLedge: arr[3],
        hasRedge: arr[4]
      };
    },
    (r: TestData) => {
      return [
        { min: r.min, max: r.max, value: r.value },
        r.stepSize,
        r.snapToGrid
      ];
    }
  );

  const arbBounds = Jsc.bless({
    generator: Jsc.nat.generator.flatMap((min: number) => {
      return arb1Up.generator.map((width: number) => {
        return {
          left: min,
          width,
          right: min + width
        };
      });
    })
  });

  Jsc.syncProperty(
    'Reducing never goes beyond min-1',
    [
      arbData
    ], (data: TestData) => {
      const newValue = SliderModel.reduceBy(data.value, data.min, data.max, data.stepSize);
      Assert.eq('Checking value', true, newValue <= data.value && newValue >= data.min - 1);
      return true;
    },
    { }
  );

  Jsc.syncProperty(
    'Increasing never goes beyond max+1',
    [
      arbData
    ], (data: TestData) => {
      const newValue = SliderModel.increaseBy(data.value, data.min, data.max, data.stepSize);
      Assert.eq('Checking value', true, newValue >= data.value && newValue <= data.max + 1);
      return true;
    },
    { }
  );

  Jsc.syncProperty(
    'Finding value of snapped always results in a factorable value',
    [
      arbData,
      arbBounds,
      Jsc.nat
    ],
    (data: TestData, bounds: TestBounds, xValue: number) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: true,
        snapStart: Option.none<number>(),
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
      return true;
    },
    { }
  );

  Jsc.syncProperty(
    'Finding value of snapped always results in a factorable value with a snap start',
    [
      arbData,
      arbBounds,
      Jsc.nat,
      Jsc.nat
    ],
    (data: TestData, bounds: TestBounds, xValue: number, snapOffset: number) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: true,
        snapStart: Option.some(snapOffset + data.min),
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
      return true;
    },
    { }
  );

  Jsc.syncProperty(
    'Finding value of any value always fits in the [min - 1, max + 1] range',
    [
      arbData,
      arbBounds,
      Jsc.nat
    ],
    (data: TestData, bounds: TestBounds, xValue: number) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: data.snapToGrid,
        snapStart: Option.none<number>(),
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
      return true;
    }
  );

  Jsc.syncProperty(
    'Finding value of any value always fits in the [min - 1, max + 1] range with a snap start',
    [
      arbData,
      arbBounds,
      Jsc.nat,
      Jsc.nat
    ],
    (data: TestData, bounds: TestBounds, xValue: number, snapOffset: number) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: data.snapToGrid,
        snapStart: Option.some(snapOffset + data.min <= data.max ? snapOffset + data.min : data.max),
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
      return true;
    }
  );
});
