import { Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as RangePoint from 'tinymce/core/dom/RangePoint';

describe('browser.tinymce.core.dom.RangePointsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    content_style: 'body.mce-content-body, p { margin: 0 }'
  }, []);

  const pAssertXYWithinRange = (editor: Editor, x: number, y: number) => Waiter.pTryUntil('Assert XY position is within selection range', () => {
    const actual = RangePoint.isXYWithinRange(x, y, editor.selection.getRng());
    assert.isTrue(actual, 'Assert XY position is within selection range');
  });

  it('point in image selection', async () => {
    const editor = hook.editor();
    // Insert 20x20px image
    editor.setContent('<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAHUlEQVR42mNk+A+EVASMowaOGjhq4KiBowaOVAMBOBYn7dVkgssAAAAASUVORK5CYII="></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await pAssertXYWithinRange(editor, 10, 10);
  });

  it('point in text content selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Some text content</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 9);
    await pAssertXYWithinRange(editor, 15, 5);
  });

  it('point in table selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p><table><tbody><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 0, 1, 0 ], 8);
    await pAssertXYWithinRange(editor, 25, 20);
    await pAssertXYWithinRange(editor, 150, 20);
  });
});
