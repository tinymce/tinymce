import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as LineUtils from 'tinymce/core/caret/LineUtils';

const rect = (x: number, y: number, w: number, h: number) => ({
  left: x,
  top: y,
  bottom: y + h,
  right: x + w,
  width: w,
  height: h
});

describe('browser.tinymce.core.LineUtilsTest', () => {
  it('findClosestClientRect', () => {
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 15), rect(10, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 27), rect(30, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(30, 10, 10, 10) ], 23), rect(10, 10, 10, 10));
    assert.deepEqual(LineUtils.findClosestClientRect([ rect(10, 10, 10, 10), rect(20, 10, 10, 10) ], 13), rect(10, 10, 10, 10));
  });
});
