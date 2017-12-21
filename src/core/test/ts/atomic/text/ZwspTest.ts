import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('atomic.tinymce.core.text.ZwspTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();

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

