import { FocusTools, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

describe('browser.tinymce.core.focus.KeyboardShortcutMenuFocusTest', () => {

  Arr.each([
    { label: 'classic mode', options: {}},
    { label: 'inline mode', options: { inline: true }},
    { label: 'class bottom', options: { toolbar_location: 'bottom' }}
  ], (tester) => {
    context(tester.label, () => {
      const hook = TinyHooks.bddSetup({
        statusbar: false,
        ...tester.options,
        base_url: '/project/tinymce/js/tinymce'
      }, [], true);

      it('TINY-2884: Pressing Alt+F9 focuses the element path and escape from the toolbar will focus the editor', async () => {
        const editor = hook.editor();
        const doc = SugarDocument.getDocument();
        await TinyUiActions.pWaitForUi(editor, '.tox-editor-header');
        TinyContentActions.keystroke(editor, 120, { alt: true });
        await FocusTools.pTryOnSelector('Assert menubar is focused', doc, 'div[role=menubar] .tox-mbtn');
        TinyUiActions.keystroke(editor, Keys.escape());
      });
    });
  });
});
