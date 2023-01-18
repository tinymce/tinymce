import { describe, it, before, after, afterEach } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.DefaultLinkTargetTest', () => {
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

  afterEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: does not add target if no default is set', async () => {
    const editor = hook.editor();
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[target="_blank"]': 0, 'a': 1 });
  });

  it('TBA: adds target if default is set', async () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[target="_blank"]': 1, 'a': 1 });
  });

  it('TBA: adds target if default is set and link_target_list is enabled', async () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    editor.options.set('link_target_list', [
      { title: 'None', value: '' },
      { title: 'New', value: '_blank' }
    ]);
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[target="_blank"]': 1, 'a': 1 });
  });

  it('TBA: adds target if default is set and link_target_list is disabled', async () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    editor.options.set('link_target_list', false);
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[target="_blank"]': 1, 'a': 1 });
    editor.options.unset('link_target_list');
  });

  it(`TBA: changing to current window doesn't apply the default`, async () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[target="_blank"]': 1, 'a': 1 });
    await TestLinkUi.pOpenLinkDialog(editor);
    await TestLinkUi.pSetListBoxItem(editor, 'Open link in...', 'Current window');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, { 'a:not([target="_blank"])': 1, 'a': 1 });
  });

  it(`TBA: default isn't applied to an existing link`, async () => {
    const editor = hook.editor();
    editor.options.set('link_default_target', '_blank');
    editor.setContent('<a href="http://www.google.com">https://www.google.com/</a>');
    await TestLinkUi.pAssertContentPresence(editor, { 'a:not([target="_blank"])': 1, 'a': 1 });
    await TestLinkUi.pOpenLinkDialog(editor);
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, { 'a:not([target="_blank"])': 1, 'a': 1 });
  });
});
