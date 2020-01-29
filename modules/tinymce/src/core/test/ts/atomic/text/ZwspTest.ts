import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('atomic.tinymce.core.text.ZwspTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  suite.test('ZWSP', function () {
    LegacyUnit.strictEqual(Zwsp.ZWSP, '\uFEFF');
  });

  suite.test('isZwsp', function () {
    LegacyUnit.strictEqual(Zwsp.isZwsp(Zwsp.ZWSP), true);
  });

  suite.test('isZwsp', function () {
    LegacyUnit.strictEqual(Zwsp.trim('a' + Zwsp.ZWSP + 'b'), 'ab');
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
