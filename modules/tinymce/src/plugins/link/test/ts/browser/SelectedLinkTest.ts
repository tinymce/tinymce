import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.SelectedLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link openlink unlink',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: should not get anchor info if not selected node', async () => {
    TestLinkUi.clearHistory();
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0 ], 1);
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForDialog(editor);
    TestLinkUi.assertDialogContents({
      href: '',
      text: '',
      title: '',
      target: ''
    });
    await TestLinkUi.pClickCancel(editor);
    TestLinkUi.clearHistory();
  });

  it('TINY-4867: link should not be active when multiple links or plain text selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>');
    // Check the link button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Insert/edit link"].tox-tbtn--enabled');
    // Check the link button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Insert/edit link"].tox-tbtn--enabled');
    // Check the link button is disabled (text)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Insert/edit link"]:not(.tox-tbtn--enabled)');
    // Check the link button is disabled (multiple links)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Insert/edit link"]:not(.tox-tbtn--enabled)');
  });

  it('TINY-4867: openlink should be disabled when multiple links or plain text selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>');
    // Check the open link button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Open link"]:not(.tox-tbtn--disabled)');
    // Check the open link button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Open link"]:not(.tox-tbtn--disabled)');
    // Check the open link button is disabled (text)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Open link"].tox-tbtn--disabled');
    // Check the open link button is disabled (multiple links)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Open link"].tox-tbtn--disabled');
  });

  it('TINY-4867: unlink should be enabled when single link or multiple links selected', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com">a</a> b <a href="http://tinymce.com">c</a></p>');
    // Check the unlink button is enabled (single link)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 3);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Remove link"]:not(.tox-tbtn--disabled)');
    // Check the unlink button is enabled (collapsed in link)
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Remove link"]:not(.tox-tbtn--disabled)');
    // Check the unlink button is disabled (text)
    TinySelections.setSelection(editor, [ 0, 1 ], 0, [ 0, 1 ], 2);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Remove link"].tox-tbtn--disabled');
    // Check the unlink button is enabled (multiple links)
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await TinyUiActions.pWaitForUi(editor, 'button[title="Remove link"]:not(.tox-tbtn--disabled)');
  });
});
