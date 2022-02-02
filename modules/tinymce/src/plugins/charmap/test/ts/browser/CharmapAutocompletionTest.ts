import { Keys, PhantomSkipper } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.charmap.AutocompletionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('TBA: Autocomplete, trigger an autocomplete and check it appears', async () => {
    const editor = hook.editor();
    editor.setContent('<p>:co</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    TinyContentActions.keypress(editor, 'o'.charCodeAt(0));
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter');
    TinyContentActions.keydown(editor, Keys.enter());

    // This assertion does not pass on Phantom. The editor content
    // is empty. Not sure if it's an encoding issue for entities.
    if (!PhantomSkipper.detect()) {
      TinyAssertions.assertContent(editor, '<p>₡</p>');
    }
  });
});
