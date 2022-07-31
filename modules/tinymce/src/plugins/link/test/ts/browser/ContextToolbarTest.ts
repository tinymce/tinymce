import { Mouse, UiFinder } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

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
    // I believe this does not do much, since the toolbar will never be in
    // in the editor body. The toolbar exists in the .tox-tinymce-aux portal
    // which exists at the top level.
    UiFinder.notExists(editorBody, '.tox-toolbar button[aria-label="Link"]');
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
    // You might be wondering why I did not use UiFinder.notExists.
    // And the reason being simply it doesn't work in this case.
    // I am not sure why, but you can put a  link in the editor content
    // and click on it. The tollbar will show as it should, while the call
    // UiFinder.notExists(SugarBody.body(), '.tox-toolbar') will still pass
    // when it should fail since the toolbar does exist
    const isNotToolbarFound = UiFinder.findIn(SugarBody.body(), '.tox-toolbar').isError();
    assert.isTrue(isNotToolbarFound, 'There is no toolbar when clicking on non link elements');
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
