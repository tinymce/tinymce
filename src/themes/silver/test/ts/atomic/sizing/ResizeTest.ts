import { Assertions, Log, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { calcCappedSize, calcChromeHeight, getDimensions, ResizeTypes } from '../../../../main/ts/ui/sizing/Resize';
import { Option } from '@ephox/katamari';

const mockEditor = (containerHeight, contentAreaHeight) => {
  const settings = {
    min_height: 400,
    max_height: 600,
    min_width: 400,
    max_width: 600,
  };

  return {
    getParam: (param, fallback, type) => settings[param],
    getContainer: () => ({ scrollHeight: containerHeight }),
    contentAreaContainer: {
      scrollHeight: contentAreaHeight
    }
  };
};

UnitTest.asynctest('Editor resizing tests', function (success, failure) {
  const makeChromeHeightTest = (label, containerHeight, contentAreaHeight, expected) => {
    return Log.step('TBA', label, Step.sync(() => {
      const chromeHeight = containerHeight - contentAreaHeight;
      const editor = mockEditor(containerHeight, containerHeight - chromeHeight);
      const actual = calcChromeHeight(editor);
      Assertions.assertEq('Chrome height should match expected', expected, actual);
    }));
  };

  const makeCappedSizeTest = (label, originalSize, delta, minSize, maxSize, expected) => {
    return Logger.t(label, Step.sync(() => {
      const actual = calcCappedSize(originalSize, delta, minSize, Option.some(maxSize));
      Assertions.assertEq('Editor size should match expected', expected, actual);
    }));
  };

  const makeDimensionsTest = (label: string, containerHeight: number, topDelta: number, leftDelta: number, resizeType: ResizeTypes, getContainerWidth: () => number, expected) => {
    return Logger.t(label, Step.sync(() => {
      const chromeHeight = containerHeight / 5; // just need something smaller
      const editor = mockEditor(containerHeight, containerHeight - chromeHeight);
      const deltas = { top: () => topDelta, left: () => leftDelta };
      const actual = getDimensions(editor, deltas, resizeType, chromeHeight, () => containerHeight, getContainerWidth);
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
    makeDimensionsTest('No change', 500, 0, 0, ResizeTypes.Both, () => 500, { height: 500, width: 500 }),
    makeDimensionsTest('Within bounds', 500, 50, 50, ResizeTypes.Both, () => 500, { height: 550, width: 550 }),
    makeDimensionsTest('Height less than minimum, only vertical resize', 500, -500, 0, ResizeTypes.Vertical, () => 500, { height: 400 }),
    makeDimensionsTest('Height greater than maximum, only vertical resize', 500, 500, 0, ResizeTypes.Vertical, () => 500, { height: 600 }),
    makeDimensionsTest('Height less than minimum, both resize, OK width change', 500, -500, 50, ResizeTypes.Both, () => 500, { height: 400, width: 550 }),
    makeDimensionsTest('Height greater than maximum, both resize, OK width change', 500, 500, 50, ResizeTypes.Both, () => 500, { height: 600, width: 550 }),
    makeDimensionsTest('Width less than minimum, no height change', 500, 0, -500, ResizeTypes.Both, () => 500, { height: 500, width: 400 }),
    makeDimensionsTest('Width more than maximum, no height change', 500, 0, 500, ResizeTypes.Both, () => 500, { height: 500, width: 600 }),
    makeDimensionsTest('Both less than minimum', 500, -500, -500, ResizeTypes.Both, () => 500, { height: 400, width: 400 }),
    makeDimensionsTest('Both more than maximum', 500, 500, 500, ResizeTypes.Both, () => 500, { height: 600, width: 600 }),
  ]);

  Pipeline.async({}, [
    makeChromeHeightTest('Check chrome height is calculated correctly', 200, 100, 100),
    cappedSizeTests,
    getDimensionsTests
  ], function () {
    success();
  }, failure);
});