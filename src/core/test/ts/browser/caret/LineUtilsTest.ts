import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Env from 'tinymce/core/api/Env';
import * as LineUtils from 'tinymce/core/caret/LineUtils';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.LineUtilsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  if (!Env.ceFalse) {
    return;
  }

  const rect = function (x, y, w, h) {
    return {
      left: x,
      top: y,
      bottom: y + h,
      right: x + w,
      width: w,
      height: h
    };
  };

  suite.test('findClosestClientRect', function () {
    LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 15), rect(10, 10, 10, 10));
    LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 27), rect(30, 10, 10, 10));
    LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 23), rect(10, 10, 10, 10));
    LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(20, 10, 10, 10)], 13), rect(10, 10, 10, 10));
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
