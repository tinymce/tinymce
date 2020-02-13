import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import Diff from 'tinymce/core/undo/Diff';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.undo.DiffTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  const KEEP = Diff.KEEP, INSERT = Diff.INSERT, DELETE = Diff.DELETE;

  suite.test('diff', function () {
    LegacyUnit.deepEqual(Diff.diff([], []), []);
    LegacyUnit.deepEqual(Diff.diff([1], []), [[DELETE, 1]]);
    LegacyUnit.deepEqual(Diff.diff([1, 2], []), [[DELETE, 1], [DELETE, 2]]);
    LegacyUnit.deepEqual(Diff.diff([], [1]), [[INSERT, 1]]);
    LegacyUnit.deepEqual(Diff.diff([], [1, 2]), [[INSERT, 1], [INSERT, 2]]);
    LegacyUnit.deepEqual(Diff.diff([1], [1]), [[KEEP, 1]]);
    LegacyUnit.deepEqual(Diff.diff([1, 2], [1, 2]), [[KEEP, 1], [KEEP, 2]]);
    LegacyUnit.deepEqual(Diff.diff([1], [2]), [[INSERT, 2], [DELETE, 1]]);
    LegacyUnit.deepEqual(Diff.diff([1], [2, 3]), [[INSERT, 2], [INSERT, 3], [DELETE, 1]]);
  });

  Pipeline.async({}, suite.toSteps({}), function () {
    success();
  }, failure);
});
