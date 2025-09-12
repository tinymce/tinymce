import { Keys } from '@ephox/agar';
import {describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.FloatElementNavigationTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    height: 300
  }, [], true);

  it('TBA: Able to move cursor to and from a float element', async () => {
    const editor = hook.editor();
    editor.setContent(
      `
      		<p>Tobias<span style="position: absolute; right: 30px;" contenteditable="false"> button </span><br>Linus</p>
          <p>Tobias2<span style="position: absolute; right: 30px;" contenteditable="false"> button2</span></p>
          <p>Linus2</p>` );
    TinySelections.setCursor(editor, [ 0, 0 ], 'Tobias'.length - 1);
    TinyContentActions.keydown(editor, Keys.right());
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0 ], 0);
  });

});
