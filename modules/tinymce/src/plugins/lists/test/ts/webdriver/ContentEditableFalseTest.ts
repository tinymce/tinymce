import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

describe('webdriver.tinymce.plugins.lists.BackspaceDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    toolbar: 'numlist bullist',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TINY-8920: backspace from beginning editable first LI in noneditable OL with no change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:first-child', [ RealKeys.combo({}, 'backspace') ]);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: backspace from beginning second editable LI in noneditable OL with no change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:last-child', [ RealKeys.combo({}, 'backspace') ]);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: enter from beginning editable first LI in noneditable OL with no change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:first-child', [ RealKeys.combo({}, 'enter') ]);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: enter from beginning second editable LI in noneditable OL with no change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:last-child', [ RealKeys.combo({}, 'enter') ]);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: tab from first editable LI in noneditable OL to second editable LI with no content change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 0, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:first-child', [ RealKeys.combo({}, 'tab') ]);
    TinyAssertions.assertCursor(editor, [ 0, 2, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });

  it('TINY-8920: shift-tab from second editable LI in noneditable OL to first editable LI with no content change', async () => {
    const editor = hook.editor();
    const content = '<ol contenteditable="false">\n' +
      '<li contenteditable="true">editable</li>\n' +
      '<li>noneditable</li>\n' +
      '<li contenteditable="true">editable</li>\n' +
    '</ol>';
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 1, 2, 0 ], 0); // HTML is fake-caret
    await RealKeys.pSendKeysOn('iframe => body li:last-child', [ RealKeys.combo({ shift: true }, 'tab') ]);
    TinyAssertions.assertCursor(editor, [ 0, 0, 0 ], 0);
    TinyAssertions.assertContent(editor, content);
  });
});
