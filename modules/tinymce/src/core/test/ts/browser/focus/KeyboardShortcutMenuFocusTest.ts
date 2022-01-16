import { FocusTools, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyUiActions, TinyContentActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.undo.KeyboardShortcutMenuFocusTest', () => {

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const pressDownArrowKey = (editor: Editor) => TinyUiActions.keydown(editor, Keys.down());

  const pAssertFocusOnItem = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(`Focus should be on: ${label}`, SugarDocument.getDocument(), selector);

  it('should focus on first menu bar option and submenus', async () => {
    const editor = hook.editor();
    TinyContentActions.keystroke(editor, 120, { alt: true });
    await pAssertFocusOnItem('File', '.tox-mbtn--select:contains("File")');
    TinyUiActions.keystroke(editor, 32);
    await pAssertFocusOnItem('New document', '.tox-menu-nav__js:contains("New document")');
    pressDownArrowKey(editor);
    await pAssertFocusOnItem('Print...', '.tox-menu-nav__js:contains("Print...")');
  });
});
