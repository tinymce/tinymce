import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import * as ExtendingChar from 'tinymce/core/text/ExtendingChar';

UnitTest.asynctest('atomic.tinymce.core.text.ExtendingCharTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('isExtendingChar', () => {
    LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('a'), false);
    LegacyUnit.strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
