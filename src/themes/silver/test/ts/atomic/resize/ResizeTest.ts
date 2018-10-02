import { UnitTest } from '@ephox/bedrock';
import { calcMinChromeSize, calcCappedSize } from '../../../../main/ts/ui/resize/Resize';
import { Assertions, Pipeline, Step } from '@ephox/agar';

UnitTest.asynctest('SVG Icon tests', function (success, failure) {
  const defaultMinSize = 150;

  const makeChromeSizeTest = (containerHeight, contentAreaHeight, expected) => {
    return Step.sync(() => {
      const actual = calcMinChromeSize(defaultMinSize, containerHeight, contentAreaHeight);
      Assertions.assertEq('Chrome height should match expected', expected, actual);
    });
  };

  const makeCappedSizeTest = (originalSize, delta, minSize, expected) => {
    return Step.sync(() => {
      const actual = calcCappedSize(defaultMinSize, originalSize, delta, minSize);
      Assertions.assertEq('Chrome height should match expected', expected, actual);
    });
  };

  const tests = [
    makeChromeSizeTest(200, 100, 250),
    makeChromeSizeTest(500, 300, 350),
    makeCappedSizeTest(500, 50, 250, 550),
    makeCappedSizeTest(500, -500, 250, 250),
    makeCappedSizeTest(50, 50, 250, 250),
    makeCappedSizeTest(250, -50, 250, 250),
  ];

  Pipeline.async({}, tests, function () {
    success();
  }, failure);
});