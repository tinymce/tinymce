import { UnitTest } from '@ephox/bedrock-client';
import Jsc from '@ephox/wrap-jsverify';
import { Rect } from 'ephox/sugar/api/selection/Rect.ts';

UnitTest.test('Rect', () => {
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
