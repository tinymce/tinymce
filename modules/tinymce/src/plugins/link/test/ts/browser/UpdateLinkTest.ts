import { FocusTools, Keys } from '@ephox/agar';
import { describe, it, before, afterEach } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.UpdateLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  afterEach(() => {
    TestLinkUi.clearHistory();
  });

  it('TBA: should not get anchor info if not selected node', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com" class="shouldbekept" title="shouldalsobekept">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForDialog(editor);
    TestLinkUi.assertDialogContents({
      href: 'http://tinymce.com',
      text: 'tiny',
      title: 'shouldalsobekept',
      target: ''
    });
    FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://something');
    TinyUiActions.keydown(editor, Keys.enter());
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'a[class="shouldbekept"]': 1,
      'a[title="shouldalsobekept"]': 1
    });
  });

  it('TBA: should remove attributes if unset in the dialog', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tinymce.com" class="shouldbekept" title="shouldnotbekept">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForDialog(editor);
    TestLinkUi.assertDialogContents({
      href: 'http://tinymce.com',
      text: 'tiny',
      title: 'shouldnotbekept',
      target: ''
    });
    FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://something');
    await TestLinkUi.pSetInputFieldValue(editor, 'Title', '');
    TinyUiActions.keydown(editor, Keys.enter());
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'a[class="shouldbekept"]': 1,
      'a[title="shouldnotbekept"]': 0
    });
  });

  it('TINY-7998: Updating a link with a dangerous URL should remove the href attribute', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="https://tinymce.com" title="shouldbekept">tiny</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 2);
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    FocusTools.setActiveValue(SugarDocument.getDocument(), 'javascript:alert(1)');
    TinyUiActions.submitDialog(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href]': 0,
      'a[title="shouldbekept"]': 1,
      'a:contains("tiny")': 1
    });
  });
});
