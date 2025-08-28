import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Diff from 'tinymce/core/undo/Diff';

describe('browser.tinymce.core.undo.DiffTest', () => {
  const KEEP = Diff.KEEP;
  const INSERT = Diff.INSERT;
  const DELETE = Diff.DELETE;

  it('diff', () => {
    assert.deepEqual(Diff.diff([], []), []);
    assert.deepEqual(Diff.diff([ 1 ], []), [[ DELETE, 1 ]]);
    assert.deepEqual(Diff.diff([ 1, 2 ], []), [[ DELETE, 1 ], [ DELETE, 2 ]]);
    assert.deepEqual(Diff.diff([], [ 1 ]), [[ INSERT, 1 ]]);
    assert.deepEqual(Diff.diff([], [ 1, 2 ]), [[ INSERT, 1 ], [ INSERT, 2 ]]);
    assert.deepEqual(Diff.diff([ 1 ], [ 1 ]), [[ KEEP, 1 ]]);
    assert.deepEqual(Diff.diff([ 1, 2 ], [ 1, 2 ]), [[ KEEP, 1 ], [ KEEP, 2 ]]);
    assert.deepEqual(Diff.diff([ 1 ], [ 2 ]), [[ INSERT, 2 ], [ DELETE, 1 ]]);
    assert.deepEqual(Diff.diff([ 1 ], [ 2, 3 ]), [[ INSERT, 2 ], [ INSERT, 3 ], [ DELETE, 1 ]]);
  });
});
