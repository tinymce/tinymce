import { Keyboard, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/emoticons/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.emoticons.AutocompletionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/test/js/test-emojis.js',
    emoticons_database_id: 'tinymce.plugins.emoticons.test-emojis.js'
  }, [ Plugin, Theme ], true);

  // NOTE: This is almost identical to charmap
  it('TBA: Autocomplete, trigger an autocomplete and check it appears', async () => {
    const editor = hook.editor();
    const editorDoc = TinyDom.document(editor);

    editor.setContent('<p>:ha</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    Keyboard.activeKeypress(editorDoc, 'a'.charCodeAt(0), { });
    await TinyUiActions.pWaitForPopup(editor, '.tox-autocompleter .tox-collection__item');
    Keyboard.activeKeydown(editorDoc, Keys.right(), { });
    Keyboard.activeKeydown(editorDoc, Keys.right(), { });
    Keyboard.activeKeydown(editorDoc, Keys.enter(), { });
    TinyAssertions.assertContent(editor, '<p>😂</p>');
  });
});
