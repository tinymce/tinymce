import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.ContextToolbarTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  it('TBA: no toolbar on by default', () => {
    const editor = hook.editor();
    const editorBody = TinyDom.body(editor);
    editor.setContent('<a href="http://www.google.com">google</a>');
    Mouse.trueClickOn(editorBody, 'a');
    UiFinder.notExists(editorBody, '.tox-toolbar button[aria-label="Link"]');
    editor.setContent('');
  });

  it('TBA: only after setting set to true', async () => {
    const editor = hook.editor();
    editor.settings.link_context_toolbar = true;
    editor.setContent('<a href="http://www.google.com">google</a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Remove link"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Open link"]');
    await UiFinder.pWaitForState('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === 'http://www.google.com');
  });

  it('TBA: shows relative link urls', async () => {
    const editor = hook.editor();
    editor.settings.link_context_toolbar = true;
    editor.setContent('<a href="#heading-1">heading</a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await UiFinder.pWaitForState('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === '#heading-1');
  });

  it('TBA: works with non text elements (e.g. images)', async () => {
    const editor = hook.editor();
    editor.settings.link_context_toolbar = true;
    editor.setContent('<a href="http://www.google.com/"><img src="image.jpg"></a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await UiFinder.pWaitForState('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === 'http://www.google.com/');
  });
});
