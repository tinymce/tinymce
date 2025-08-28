import { UnitTest } from '@ephox/bedrock-client';
import { assert } from 'chai';
import * as fc from 'fast-check';

import { Rect } from 'ephox/sugar/api/selection/Rect';

UnitTest.test('Rect', () => {
  fc.assert(fc.property(
    fc.float(),
    fc.float(),
    fc.float(),
    fc.float(),
    fc.float(),
    fc.float(),
    (left: number, right: number, top: number, bottom: number, width: number, height: number) =>
      assert.deepEqual({
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
  ));
});
