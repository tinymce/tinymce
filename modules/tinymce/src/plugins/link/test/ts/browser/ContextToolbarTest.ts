import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.ContextToolbarTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

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
    UiFinder.notExists(SugarBody.body(), '.tox-toolbar button[aria-label="Link"]');
    editor.setContent('');
  });

  it('TBA: only after setting set to true', async () => {
    const editor = hook.editor();
    editor.options.set('link_context_toolbar', true);
    editor.setContent('<a href="http://www.google.com">google</a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Remove link"]');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Open link"]');
    await UiFinder.pWaitForState<HTMLInputElement>('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === 'http://www.google.com');
  });

  it('TINY-8940: toolbar doesn\'t show on non link elements', async () => {
    const editor = hook.editor();
    editor.options.set('link_context_toolbar', true);
    editor.setContent('<p>google</p>');
    Mouse.trueClickOn(TinyDom.body(editor), 'p');
    await Waiter.pWait(50);
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
    editor.setContent('');
  });

  it('TBA: shows relative link urls', async () => {
    const editor = hook.editor();
    editor.options.set('link_context_toolbar', true);
    editor.setContent('<a href="#heading-1">heading</a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await UiFinder.pWaitForState<HTMLInputElement>('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === '#heading-1');
  });

  it('TBA: works with non text elements (e.g. images)', async () => {
    const editor = hook.editor();
    editor.options.set('link_context_toolbar', true);
    editor.setContent('<a href="http://www.google.com/"><img src="image.jpg"></a>');
    Mouse.trueClickOn(TinyDom.body(editor), 'a');
    await TinyUiActions.pWaitForUi(editor, '.tox-toolbar button[aria-label="Link"]');
    await UiFinder.pWaitForState<HTMLInputElement>('check link content', SugarBody.body(), '.tox-toolbar input', (ele) => ele.dom.value === 'http://www.google.com/');
  });
});
