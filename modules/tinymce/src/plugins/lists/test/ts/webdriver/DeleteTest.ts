import { RealKeys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.lists.DeleteTest', () => {
  context('Main Editor', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      toolbar: 'numlist bullist',
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

    it('TINY-10289: backspace from a `p` after an `ol` or delete from the last `li` inside the `ol` should merge the `p` inside the `li`', async () => {
      const editor = hook.editor();

      const initialContent = '<ol>' +
        '<li>' +
        'List 1' +
        '</li>' +
        '<li>' +
        '<h2>Header</h2>' +
        '<ol>' +
        '<li>List 1-1</li>' +
        '</ol>' +
        '<p>Place custor at the start of this line and hit backspace.</p>' +
        '</li>' +
        '</ol>';

      const expectedContent = '<ol>' +
        '<li>' +
        'List 1' +
        '</li>' +
        '<li>' +
        '<h2>Header</h2>' +
        '<ol>' +
        '<li>List 1-1Place custor at the start of this line and hit backspace.</li>' +
        '</ol>' +
        '</li>' +
        '</ol>';

      editor.setContent(initialContent);
      editor.undoManager.add();
      TinySelections.setCursor(editor, [ 0, 1, 2 ], 0);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertCursor(editor, [ 0, 1, 1, 0, 0 ], 'List 1-1'.length);
      TinyAssertions.assertContent(editor, expectedContent);
      editor.execCommand('undo');
      TinyAssertions.assertContent(editor, initialContent);

      editor.setContent(initialContent);
      editor.undoManager.add();
      TinySelections.setCursor(editor, [ 0, 1, 1, 0, 0 ], 'List 1-1'.length);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({}, 'Delete') ]);
      TinyAssertions.assertCursor(editor, [ 0, 1, 1, 0, 0 ], 'List 1-1'.length);
      TinyAssertions.assertContent(editor, expectedContent);
      editor.execCommand('undo');
      TinyAssertions.assertContent(editor, initialContent);
    });
  });

  context('Prevention', () => {
    const preventionHook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'lists',
      toolbar: 'numlist bullist',
      indent: false,
      setup: (editor: Editor) => {
        editor.on('init', () => {
          editor.on('keydown', (event) => {
            event.preventDefault();
          });
        });
      },
      base_url: '/project/tinymce/js/tinymce'
    }, [ Plugin ], true);

    it('TINY-13276: Backspace in selection is preventable', async () => {
      const editor = preventionHook.editor();

      const initialContent = '<ol>' +
        '<li>' +
        'List 1' +
        '</li>' +
        '</ol>';

      const expectedContent = '<ol>' +
        '<li>' +
        'List 1' +
        '</li>' +
        '</ol>';

      editor.setContent(initialContent);
      editor.undoManager.add();
      TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 5);
      await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 2, [ 0, 0, 0 ], 5);
      TinyAssertions.assertContent(editor, expectedContent);
    });
  });
});
