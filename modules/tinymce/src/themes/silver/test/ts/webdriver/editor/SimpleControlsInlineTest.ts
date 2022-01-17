import { RealMouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.SimpleControlsInlineTest', () => {

  const settings = {
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  };

  const pAssertToolbarButtonPressed = (title: string, pressed: boolean) =>
    Waiter.pTryUntil('button pressed', () => UiFinder.exists(SugarBody.body(), `button[title="${title}"][aria-pressed="${pressed ? 'true' : 'false'}"]`));

  it('TINY-6675: Button state on multiple inline editors is correct', async () => {
    const editorOne = await McEditor.pFromSettings<Editor>(settings);
    const editorTwo = await McEditor.pFromSettings<Editor>(settings);
    editorOne.setContent('<p id="number1"><strong>blarg</strong></p>');
    editorTwo.setContent('<p id="number2">blarg</p>');
    await RealMouse.pClickOn('#number1');
    await pAssertToolbarButtonPressed('Bold', true);
    await RealMouse.pClickOn('#number2');
    await pAssertToolbarButtonPressed('Bold', false);
    McEditor.remove(editorOne);
    McEditor.remove(editorTwo);
  });
});
