import { Assertions, Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { calcCappedSize, getDimensions, ResizeTypes } from 'tinymce/themes/silver/ui/sizing/Resize';

const mockEditor = (containerHeight, contentAreaHeight) => {
  const settings = {
    min_height: 400,
    max_height: 600,
    min_width: 400,
    max_width: 600,
  };

  return {
    settings,
    getParam: (param, fallback, type) => settings[param],
    getContainer: () => ({ offsetHeight: containerHeight }),
    getContentAreaContainer: () => ({ offsetHeight: contentAreaHeight })
  };
};

UnitTest.asynctest('Editor resizing tests', function (success, failure) {
  const makeCappedSizeTest = (label, originalSize, delta, minSize, maxSize, expected) => {
    return Logger.t(label, Step.sync(() => {
      const actual = calcCappedSize(originalSize, delta, Option.some(minSize), Option.some(maxSize));
      Assertions.assertEq('Editor size should match expected', expected, actual);
    }));
  };

  const makeDimensionsTest = (label: string, topDelta: number, leftDelta: number, resizeType: ResizeTypes, width, expected) => {
    return Logger.t(label, Step.sync(() => {
      const containerHeight = 500; // mid way between min and max in mockEditor
      const chromeHeight = 100; // just need something smaller
      const editor = mockEditor(containerHeight, containerHeight - chromeHeight);
      const deltas = { top: () => topDelta, left: () => leftDelta };
      const actual = getDimensions(editor, deltas, resizeType, containerHeight, width);
      Assertions.assertEq('Dimensions should match expected', expected, actual);
    }));
  };

  const cappedSizeTests = Log.stepsAsStep('TBA', 'Check editor size stays within min and max bounds', [
    makeCappedSizeTest('Within bounds', 500, 50, 250, 600, 550),
    makeCappedSizeTest('Small delta makes editor less than min size', 250, -50, 250, 600, 250),
    makeCappedSizeTest('Large delta makes editor less than min size', 500, -500, 250, 600, 250),
    makeCappedSizeTest('Original is too small for delta to make editor big enough', 50, 50, 250, 600, 250),
    makeCappedSizeTest('Large delta makes editor more than max size', 50, 600, 250, 600, 600),
    makeCappedSizeTest('Small delta makes editor more than max size', 550, 100, 250, 600, 600),
    makeCappedSizeTest('Original is too big', 650, 50, 250, 600, 600)
  ]);

  const getDimensionsTests = Log.stepsAsStep('TBA', 'Check the correct dimensions are returned', [
    makeDimensionsTest('No change', 0, 0, ResizeTypes.Both, 500, { height: 500, width: 500 }),
    makeDimensionsTest('Within bounds', 50, 50, ResizeTypes.Both, 500, { height: 550, width: 550 }),
    makeDimensionsTest('Height less than minimum, only vertical resize', -500, 0, ResizeTypes.Vertical, 500, { height: 400 }),
    makeDimensionsTest('Height greater than maximum, only vertical resize', 500, 0, ResizeTypes.Vertical, 500, { height: 600 }),
    makeDimensionsTest('Height less than minimum, both resize, OK width change', -500, 50, ResizeTypes.Both, 500, { height: 400, width: 550 }),
    makeDimensionsTest('Height greater than maximum, both resize, OK width change', 500, 50, ResizeTypes.Both, 500, { height: 600, width: 550 }),
    makeDimensionsTest('Width less than minimum, no height change', 0, -500, ResizeTypes.Both, 500, { height: 500, width: 400 }),
    makeDimensionsTest('Width more than maximum, no height change', 0, 500, ResizeTypes.Both, 500, { height: 500, width: 600 }),
    makeDimensionsTest('Both less than minimum', -500, -500, ResizeTypes.Both, 500, { height: 400, width: 400 }),
    makeDimensionsTest('Both more than maximum', 500, 500, ResizeTypes.Both, 500, { height: 600, width: 600 }),
  ]);

  Pipeline.async({}, [
    cappedSizeTests,
    getDimensionsTests
  ], function () {
    success();
  }, failure);
});