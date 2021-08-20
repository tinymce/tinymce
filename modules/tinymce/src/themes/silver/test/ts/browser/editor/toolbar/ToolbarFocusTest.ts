import { FocusTools, Keys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { McEditor, TinyContentActions, TinyDom, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.themes.silver.editor.toolbar.ToolbarFocusTest', () => {
  before(() => {
    Theme();
  });

  const pTestFocus = async (settings: RawEditorSettings) => {
    const editor = await McEditor.pFromSettings<Editor>({
      toolbar: 'undo redo | bold italic',
      menubar: false,
      statusbar: false,
      ...settings,
      base_url: '/project/tinymce/js/tinymce'
    });
    editor.focus();
    const editorDoc = TinyDom.document(editor);
    const doc = SugarDocument.getDocument();

    // Press the Alt+F10 key
    TinyContentActions.keystroke(editor, 121, { alt: true });
    await FocusTools.pTryOnSelector('Assert toolbar is focused', doc, 'div[role=toolbar] .tox-tbtn');
    TinyUiActions.keystroke(editor, Keys.escape());
    await FocusTools.pTryOnSelector('Assert editor is focused', doc, 'iframe');
    await FocusTools.pTryOnSelector('Assert editor is focused', editorDoc, 'body');
    McEditor.remove(editor);
  };

  context('Pressing Alt+F10 focuses the toolbar and escape from the toolbar will focus the editor', () => {
    it('TINY-6230: Floating toolbar', () =>
      pTestFocus({ toolbar_mode: 'floating' })
    );

    it('TINY-6230: Sliding toolbar', () =>
      pTestFocus({ toolbar_mode: 'sliding' })
    );

    it('TINY-6230: Wrap toolbar', () =>
      pTestFocus({ toolbar_mode: 'wrap' })
    );

    it('TINY-6230: Multiple toolbars', () =>
      pTestFocus({ toolbar: [ 'undo redo', 'bold italic' ] })
    );
  });
});
