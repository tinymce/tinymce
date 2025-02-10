import { FocusTools, Keys, Waiter } from '@ephox/agar';
import { describe, it, before, afterEach, context } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.UpdateLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: '',
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Plugin ]);

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

  context('Block links', () => {
    it('TINY-9172: Should update a root block link', async () => {
      const editor = hook.editor();
      editor.setContent('<a href="#1"><p>tiny</p></a>');
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);
      editor.execCommand('mceLink');
      await TinyUiActions.pWaitForDialog(editor);
      FocusTools.setActiveValue(SugarDocument.getDocument(), '#2');
      TinyUiActions.submitDialog(editor);
      await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<a href="#2"><p>tiny</p></a>'));
    });

    it('TINY-9172: Should update a wrapped block link', async () => {
      const editor = hook.editor();
      editor.setContent('<div><a href="#1"><p>tiny</p></a></div>');
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 1);
      editor.execCommand('mceLink');
      await TinyUiActions.pWaitForDialog(editor);
      FocusTools.setActiveValue(SugarDocument.getDocument(), '#2');
      TinyUiActions.submitDialog(editor);
      await Waiter.pTryUntil('Wait for content to change', () => TinyAssertions.assertContent(editor, '<div><a href="#2"><p>tiny</p></a></div>'));
    });
  });
});
