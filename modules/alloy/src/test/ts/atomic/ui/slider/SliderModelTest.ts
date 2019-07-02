import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import * as SliderModel from 'ephox/alloy/ui/slider/SliderModel';

UnitTest.test('Atomic Test: ui.slider.SliderModelTest', () => {
  const arb1Up = Jsc.nat.smap((num) => num + 1, (num) => num - 1);

  const arbRanged = Jsc.bless({
    generator: Jsc.nat.generator.flatMap((min) => {
      return arb1Up.generator.flatMap((width) => {
        const max = min + width;
        return Jsc.number(min - 1, max + 1).generator.map((value) => {
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
    (arr) => {
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
    (r) => {
      return [
        { min: r.min, max: r.max, value: r.value },
        r.stepSize,
        r.snapToGrid
      ];
    }
  );

  const arbBounds = Jsc.bless({
    generator: Jsc.nat.generator.flatMap((min) => {
      return arb1Up.generator.map((width) => {
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
    ], (data) => {
      const newValue = SliderModel.reduceBy(data.value, data.min, data.max, data.stepSize);
      RawAssertions.assertEq('Checking value', true, newValue <= data.value && newValue >= data.min - 1);
      return true;
    },
    { }
  );

  Jsc.syncProperty(
    'Increasing never goes beyond max+1',
    [
      arbData
    ], (data) => {
      const newValue = SliderModel.increaseBy(data.value, data.min, data.max, data.stepSize);
      RawAssertions.assertEq('Checking value', true, newValue >= data.value && newValue <= data.max + 1);
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
    (data, bounds, xValue) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: true,
        snapStart: Option.none(),
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
      RawAssertions.assertEq('Checking factors correctly', true, actual);
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
    (data, bounds, xValue, snapOffset) => {
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
      RawAssertions.assertEq('Checking factors correctly: ' + newValue, true,
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
    (data, bounds, xValue) => {
      const args = {
        min: data.min,
        max: data.max,
        range: data.max - data.min,
        value: xValue,
        step: data.stepSize,
        snap: data.snapToGrid,
        snapStart: Option.none(),
        rounded: data.rounded,
        hasMinEdge: data.hasLedge,
        hasMaxEdge: data.hasRedge,
        minBound: bounds.left,
        maxBound: bounds.right,
        screenRange: bounds.width
      };
      const newValue = SliderModel.findValueOf(args);
      RawAssertions.assertEq(
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
    (data, bounds, xValue, snapOffset) => {
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
      RawAssertions.assertEq(
        'Assert within range: ' + newValue, true,
        newValue >= data.min - 1 && newValue <= data.max + 1
      );
      return true;
    }
  );
});
