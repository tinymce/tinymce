import { UnitTest, assert } from '@ephox/bedrock';
import { RawRect, Rect, StructRect } from 'ephox/sugar/api/selection/Rect.ts';

UnitTest.test('Rect', function () {
  const sr: StructRect = {
    left: () => 3,
    top: () => 2,
    right: () => 12,
    bottom: () => 5,
    width: () => 533,
    height: () => 2
  };
  const r: RawRect = Rect.toRaw(sr);
  assert.eq({
    left: 3,
    top: 2,
    right: 12,
    bottom: 5,
    width: 533,
    height: 2
  }, r);
});
