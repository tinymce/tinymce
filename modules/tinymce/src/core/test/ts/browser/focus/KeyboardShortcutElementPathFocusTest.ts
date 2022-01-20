import { FocusTools, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';

describe('browser.tinymce.themes.silver.editor.toolbar.KeyboardShortcutElementPathFocusTest ', () => {

  const pTestFocus = async (options: RawEditorOptions) => {
    const editor = await McEditor.pFromSettings<Editor>({
      menubar: false,
      ...options,
      base_url: '/project/tinymce/js/tinymce'
    });
    // currently for me i need to actually focus on the browser window for the test to pass, not sure if there's a bug somewhere
    editor.focus();

    const doc = SugarDocument.getDocument();

    TinyContentActions.keystroke(editor, 122, { alt: true });

    await FocusTools.pTryOnSelector('Assert element path is focused', doc, 'div[role=navigation] .tox-statusbar__path-item');
    TinyUiActions.keystroke(editor, Keys.escape());
    McEditor.remove(editor);
  };

  context('TINY-2884: Pressing Alt+F11 focuses the element path and escape from the toolbar will focus the editor', () => {
    it('classic mode', () =>
      pTestFocus({ })
    );

    it('class bottom', () =>
      pTestFocus({ toolbar_location: 'bottom' })
    );
  });
});
