import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.util.ToolsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  suite.test('extend', function () {
    LegacyUnit.deepEqual({ a: 1, b: 2, c: 3 }, Tools.extend({ a: 1 }, { b: 2 }, { c: 3 }));
    LegacyUnit.deepEqual({ a: 1, c: 3 }, Tools.extend({ a: 1 }, null, { c: 3 }));
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
