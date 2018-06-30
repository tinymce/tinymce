import { RawAssertions } from '@ephox/agar';
import * as SliderModel from 'ephox/alloy/ui/slider/SliderModel';
import { Option } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';


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

  const arbData = Jsc.tuple([arbRanged, arb1Up, Jsc.bool, Jsc.bool, Jsc.bool, Jsc.bool]).smap(
    (arr) => {
      return {
        min: arr[0].min,
        max: arr[0].max,
        value: arr[0].value,
        stepSize: arr[1],
        snapToGrid: arr[2],
        rounded: arr[3],
        hasLedge: arr[4],
        hasRedge: arr[5]
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
/*
  Jsc.syncProperty(
    'Finding value of snapped always results in a factorable value',
    [
      arbData,
      arbBounds,
      Jsc.nat
    ],
    (data, bounds, xValue) => {
      const newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, true, Option.none(), data.rounded, data.hasLedge, data.hasRedge);
      const f = Math.abs((newValue - data.min) / data.stepSize);
      RawAssertions.assertEq('Checking factors correctly: ' + newValue, true,
        Math.floor(f) === f || newValue === data.min - 1 || newValue === data.max + 1
      );
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
      const newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, true, Option.some(snapOffset + data.min), data.rounded, data.hasLedge, data.hasRedge);
      const f = Math.abs((newValue - (data.min + snapOffset)) / data.stepSize);
      RawAssertions.assertEq('Checking factors correctly: ' + newValue, true,
        Math.floor(f) === f || newValue === data.min - 1 || newValue === data.max + 1
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
      const newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, data.snapToGrid, Option.none(), data.rounded, data.hasLedge, data.hasRedge);
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
      const newValue = SliderModel.findValueOfX(bounds, data.min, data.max, xValue, data.stepSize, data.snapToGrid, Option.some(snapOffset + data.min <= data.max ? snapOffset + data.min : data.max), data.rounded, data.hasLedge, data.hasRedge);
      RawAssertions.assertEq(
        'Assert within range: ' + newValue, true,
        newValue >= data.min - 1 && newValue <= data.max + 1
      );
      return true;
    }
  );
  */
});
