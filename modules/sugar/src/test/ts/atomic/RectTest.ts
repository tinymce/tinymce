import { UnitTest } from '@ephox/bedrock';
import { Rect, StructRect } from 'ephox/sugar/api/selection/Rect.ts';
import Jsc from '@ephox/wrap-jsverify';

UnitTest.test('Rect', function () {
  Jsc.property(
    'Rect',
    Jsc.number,
    Jsc.number,
    Jsc.number,
    Jsc.number,
    Jsc.number,
    Jsc.number,
    (left: number, right: number, top: number, bottom: number, width: number, height: number) =>
      Jsc.eq({
        left,
        top,
        right,
        bottom,
        width,
        height
      }, Rect.toRaw({
        left: () => left,
        top: () => top,
        right: () => right,
        bottom: () => bottom,
        width: () => width,
        height: () => height
      }))
  );
});
