import { RealMouse, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.mouse.PositionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'undo redo | bold'
  }, []);

  before(() => hook.editor().focus());

  it('TINYMCE-14724: having an empty format span at the start of the text and clicking to the right of an nbsp at the end should not move the caret to the empty format span position', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Note</p><p>R&nbsp;</p>');
    editor.execCommand('FontSize', false, '10px');

    await RealMouse.pClickOn('iframe => p:nth-of-type(2)');
    await Waiter.pTryUntil('Wait for the caret to be positioned after the nbsp', () =>
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 2));
  });
});
