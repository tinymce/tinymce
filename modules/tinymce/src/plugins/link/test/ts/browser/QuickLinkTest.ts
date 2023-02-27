import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.QuickLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    link_quicklink: true,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const doc = SugarDocument.getDocument();

  const metaKey = PlatformDetection.detect().os.isMacOS() ? { metaKey: true } : { ctrlKey: true };

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  const pOpenQuickLink = async (editor: Editor) => {
    editor.execCommand('mceLink');
    // tests were erroneously allowed to pass when the quick link dialog would
    // open and very quickly close because this was happening at superhuman
    // speeds. So I'm slowing it down.
    await Waiter.pWait(100);
    await FocusTools.pTryOnSelector('Selector should be in context form input', doc, '.tox-toolbar input');
  };

  it('TBA: Checking that QuickLink can insert a link', async () => {
    const editor = hook.editor();
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud');
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      'a[href="http://tiny.cloud"]': 1,
      'a:contains("http://tiny.cloud")': 1
    });
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TBA: Checking that QuickLink can add a link to selected text and keep the current text', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Word</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], ''.length, [ 0, 0 ], 'Word'.length);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/2');
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      'a[href="http://tiny.cloud/2"]': 1,
      'a:contains("http://tiny.cloud/2")': 0,
      'a:contains("Word")': 1
    });
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TBA: Checking that QuickLink can add a link to a selected image and keep the current image', async () => {
    const editor = hook.editor();
    editor.setContent('<p><img src="image.jpg"></p>');
    TinySelections.select(editor, 'img', []);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/2');
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      'a[href="http://tiny.cloud/2"]': 1,
      'a:contains("http://tiny.cloud/2")': 0,
      'img[src="image.jpg"]': 1
    });
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TBA: Checking that QuickLink can edit an existing link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/3">Word</a></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 'W'.length, [ 0, 0, 0 ], 'Wo'.length);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/changed/3');
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      'a[href="http://tiny.cloud/changed/3"]': 1,
      'a:contains("http://tiny.cloud/3")': 0,
      'a:contains("Word")': 1
    });
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TBA: Checking that QuickLink can remove an existing link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/4">Word</a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 'Wor'.length);
    await pOpenQuickLink(editor);
    TinyUiActions.keydown(editor, Keys.tab());
    TinyUiActions.keydown(editor, Keys.right());
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContentPresence(editor, {
      'a': 0,
      'p:contains("Word")': 1
    });
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TINY-5952: Checking that QuickLink link-creations end up on the undo stack', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Word</p>');
    // add link to word
    TinySelections.setSelection(editor, [ 0, 0 ], ''.length, [ 0, 0 ], 'Word'.length);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/5');
    TinyUiActions.keydown(editor, Keys.enter());
    // undo
    editor.execCommand('undo');
    TinyAssertions.assertContentPresence(editor, {
      'a': 0,
      'p:contains("Word")': 1
    });
  });

  it('TINY-5952: Checking that QuickLink link-edits end up on the undo stack', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/6">Word</a></p>');
    // change the existing link
    TinySelections.setSelection(editor, [ 0, 0, 0 ], ''.length, [ 0, 0, 0 ], 'Word'.length);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/changed/6');
    TinyUiActions.keydown(editor, Keys.enter());
    // undo (to old link)
    editor.execCommand('undo');
    TinyAssertions.assertContentPresence(editor, {
      'a:contains("http://tiny.cloud/changed/6")': 0,
      'a[href="http://tiny.cloud/6"]': 1,
      'a:contains("Word")': 1
    });
  });

  it('TINY-5952: Checking that QuickLink link-deletes end up on the undo stack', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://tiny.cloud/7">Word</a></p>');
    // remove the link
    TinySelections.setSelection(editor, [ 0, 0, 0 ], ''.length, [ 0, 0, 0 ], 'Word'.length);
    await pOpenQuickLink(editor);
    TinyUiActions.keydown(editor, Keys.tab());
    TinyUiActions.keydown(editor, Keys.right());
    TinyUiActions.keydown(editor, Keys.enter());
    // undo once (bring back link)
    editor.execCommand('undo');
    TinyAssertions.assertContentPresence(editor, {
      'a[href="http://tiny.cloud/7"]': 1,
      'a:contains("Word")': 1
    });
  });

  it('TINY-8057: Checking that mceLink command can open Quicklink and dialog', async () => {
    const editor = hook.editor();
    editor.setContent('');
    editor.execCommand('mcelink', false, { dialog: true });
    await TinyUiActions.pWaitForDialog(editor);
    TinyUiActions.closeDialog(editor);
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForPopup(editor, '.tox-pop .tox-toolbar');
    await FocusTools.pTryOnSelector('Selector should be in context form input', doc, '.tox-toolbar input');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TINY-8057: Checking Quicklink opens with keyboard shortcut', async () => {
    const editor = hook.editor();
    editor.setContent('');
    TinyContentActions.keystroke(editor, 'K'.charCodeAt(0), metaKey);
    await TinyUiActions.pWaitForPopup(editor, '.tox-pop__dialog .tox-toolbar');
    await FocusTools.pTryOnSelector('Selector should be in context form input', doc, '.tox-toolbar input');
    TinyUiActions.keydown(editor, Keys.enter());
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog');
  });

  it('TINY-9593: Preserve formatting on text selection', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Lorem <em><strong>ipsum</strong></em> dolor sit amet</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0, 0 ], ''.length, [ 0, 1, 0, 0 ], 'ipsum'.length);
    await pOpenQuickLink(editor);
    FocusTools.setActiveValue(doc, 'http://tiny.cloud/2');
    TinyUiActions.keydown(editor, Keys.enter());
    TinyAssertions.assertContent(editor, '<p>Lorem <a href="http://tiny.cloud/2"><em><strong>ipsum</strong></em></a> dolor sit amet</p>');
  });
});
