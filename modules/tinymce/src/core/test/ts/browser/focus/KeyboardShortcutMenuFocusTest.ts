import { FocusTools, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.themes.silver.editor.toolbar.KeyboardShortcutMenuFocusTest', () => {

  const pTestFocus = async (options: RawEditorOptions) => {
    const editor = await McEditor.pFromSettings<Editor>({
      statusbar: false,
      ...options,
      base_url: '/project/tinymce/js/tinymce'
    });
    //currently for me i need to actually focus on the browser window for the test to pass, not sure if there's a bug somewhere
    editor.focus();

    // const editorDoc = TinyDom.document(editor);
    const doc = SugarDocument.getDocument();

    // Timeout before shortcut, inline mode seems to have a slower render time
    setTimeout(() => {
      TinyContentActions.keystroke(editor, 120, { alt: true });
    }, 500);
    
    await FocusTools.pTryOnSelector('Assert menubar is focused', doc, 'div[role=menubar] .tox-mbtn');
    TinyUiActions.keystroke(editor, Keys.escape());
    McEditor.remove(editor);
  };

  context('Pressing Alt+F9 focuses the menubar and escape from the toolbar will focus the editor', () => {
    it('classic mode', () =>
      pTestFocus({ })
    );

    it('inline mode', () =>
      pTestFocus({ inline: true })
    );

    it('class bottom', () =>
      pTestFocus({  toolbar_location: 'bottom' })
    );
  });
});
