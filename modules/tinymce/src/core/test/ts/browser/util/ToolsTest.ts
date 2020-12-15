import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit } from '@ephox/mcagar';
import Tools from 'tinymce/core/api/util/Tools';

UnitTest.asynctest('browser.tinymce.core.util.ToolsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  suite.test('extend', () => {
    LegacyUnit.deepEqual({ a: 1, b: 2, c: 3 }, Tools.extend({ a: 1 }, { b: 2 }, { c: 3 }));
    LegacyUnit.deepEqual({ a: 1, c: 3 }, Tools.extend({ a: 1 }, null, { c: 3 }));
  });

  Pipeline.async({}, suite.toSteps({}), success, failure);
});
