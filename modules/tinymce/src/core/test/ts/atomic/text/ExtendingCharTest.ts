import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import * as ExtendingChar from 'tinymce/core/text/ExtendingChar';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('atomic.tinymce.core.text.ExtendingCharTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('isExtendingChar', function () {
    LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('a'), false);
    LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
