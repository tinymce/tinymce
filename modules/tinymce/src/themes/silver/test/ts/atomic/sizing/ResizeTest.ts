import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { getDimensions, ResizeTypes } from 'tinymce/themes/silver/ui/sizing/Resize';
import * as Utils from 'tinymce/themes/silver/ui/sizing/Utils';

const mockEditor = (containerHeight: number, contentAreaHeight: number): Editor => {
  const options: Record<string, number> = {
    min_height: 400,
    max_height: 600,
    min_width: 400,
    max_width: 600
  };

  return {
    options: {
      get: (param: string) => options[param]
    },
    getContainer: () => ({ offsetHeight: containerHeight }),
    getContentAreaContainer: () => ({ offsetHeight: contentAreaHeight })
  } as Editor;
};

describe('atomic.tinymce.themes.silver.sizing.ResizeTest', () => {
  const assertCappedSize = (label: string, originalSize: number, delta: number, minSize: number, maxSize: number, expected: number) => {
    const actual = Utils.calcCappedSize(originalSize + delta, Optional.some(minSize), Optional.some(maxSize));
    assert.equal(actual, expected, label);
  };

  const assertDimensions = (label: string, topDelta: number, leftDelta: number, resizeType: ResizeTypes, width: number, expected: { height: number; width?: number }) => {
    const containerHeight = 500; // mid way between min and max in mockEditor
    const chromeHeight = 100; // just need something smaller
    const editor = mockEditor(containerHeight, containerHeight - chromeHeight);
    const deltas = SugarPosition(leftDelta, topDelta);
    const actual = getDimensions(editor, deltas, resizeType, containerHeight, width);
    assert.deepEqual(actual, expected, label);
  };

  it('TBA: Check editor size stays within min and max bounds', () => {
    assertCappedSize('Within bounds', 500, 50, 250, 600, 550);
    assertCappedSize('Small delta makes editor less than min size', 250, -50, 250, 600, 250);
    assertCappedSize('Large delta makes editor less than min size', 500, -500, 250, 600, 250);
    assertCappedSize('Original is too small for delta to make editor big enough', 50, 50, 250, 600, 250);
    assertCappedSize('Large delta makes editor more than max size', 50, 600, 250, 600, 600);
    assertCappedSize('Small delta makes editor more than max size', 550, 100, 250, 600, 600);
    assertCappedSize('Original is too big', 650, 50, 250, 600, 600);
  });

  it('TBA: Check the correct dimensions are returned', () => {
    assertDimensions('No change', 0, 0, ResizeTypes.Both, 500, { height: 500, width: 500 });
    assertDimensions('Within bounds', 50, 50, ResizeTypes.Both, 500, { height: 550, width: 550 });
    assertDimensions('Height less than minimum, only vertical resize', -500, 0, ResizeTypes.Vertical, 500, { height: 400 });
    assertDimensions('Height greater than maximum, only vertical resize', 500, 0, ResizeTypes.Vertical, 500, { height: 600 });
    assertDimensions('Height less than minimum, both resize, OK width change', -500, 50, ResizeTypes.Both, 500, { height: 400, width: 550 });
    assertDimensions('Height greater than maximum, both resize, OK width change', 500, 50, ResizeTypes.Both, 500, { height: 600, width: 550 });
    assertDimensions('Width less than minimum, no height change', 0, -500, ResizeTypes.Both, 500, { height: 500, width: 400 });
    assertDimensions('Width more than maximum, no height change', 0, 500, ResizeTypes.Both, 500, { height: 500, width: 600 });
    assertDimensions('Both less than minimum', -500, -500, ResizeTypes.Both, 500, { height: 400, width: 400 });
    assertDimensions('Both more than maximum', 500, 500, ResizeTypes.Both, 500, { height: 600, width: 600 });
  });
});
