import { describe, it, before, after, afterEach } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    link_target_list: [
      { title: 'New page', value: '_blank' }
    ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  afterEach(() => {
    hook.editor().setContent('');
  });

  it(`TBA: doesn't add rel noopener stuff with allow_unsafe_link_target: true`, async () => {
    const editor = hook.editor();
    editor.options.set('allow_unsafe_link_target', true);
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 0, 'a': 1 });
  });

  it('TBA: adds if allow_unsafe_link_target: false', async () => {
    const editor = hook.editor();
    editor.options.set('allow_unsafe_link_target', false);
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 1 });
  });

  it(`TBA: adds if allow_unsafe_link_target: undefined`, async () => {
    const editor = hook.editor();
    editor.options.set('allow_unsafe_link_target', undefined);
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 1 });
  });

  it(`TBA: allow_unsafe_link_target=false: node filter normalizes and secures rel on SetContent`, () => {
    const editor = hook.editor();
    editor.options.set('allow_unsafe_link_target', false);
    editor.setContent('<p><a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a></p>');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.google.com" target="_blank" rel="alternate nofollow noopener">Google</a></p>');
  });

  it('TBA: allow_unsafe_link_target=false: proper option selected for defined link_rel_list', async () => {
    const editor = hook.editor();
    editor.options.set('allow_unsafe_link_target', false);
    editor.options.set('link_rel_list', [
      { title: 'Lightbox', value: 'lightbox' },
      { title: 'Test rel', value: 'alternate nofollow' },
      { title: 'Table of contents', value: 'toc' }
    ]);
    editor.setContent('<p><a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a></p>');
    TinySelections.select(editor, 'p', [ 0 ]);
    await TestLinkUi.pOpenLinkDialog(editor);
    TestLinkUi.assertDialogContents({
      text: 'Google',
      title: '',
      href: 'http://www.google.com',
      target: '_blank',
      rel: 'alternate nofollow noopener'
    });
    // Clicking "cancel" here instead of "ok" so that it doesn't fire a pending insert.
    await TestLinkUi.pClickCancel(editor);
  });
});
