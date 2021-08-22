import { describe, it, before, after, afterEach } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.AllowUnsafeLinkTargetTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    target_list: [
      { title: 'New page', value: '_blank' }
    ],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

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
    editor.settings.allow_unsafe_link_target = true;
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 0, 'a': 1 });
  });

  it('TBA: adds if allow_unsafe_link_target: false', async () => {
    const editor = hook.editor();
    editor.settings.allow_unsafe_link_target = false;
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 1 });
  });

  it(`TBA: adds if allow_unsafe_link_target: undefined`, async () => {
    const editor = hook.editor();
    editor.settings.allow_unsafe_link_target = undefined;
    await TestLinkUi.pInsertLink(editor, 'http://www.google.com');
    await TestLinkUi.pAssertContentPresence(editor, { 'a[rel="noopener"]': 1 });
  });

  it(`TBA: allow_unsafe_link_target=false: node filter normalizes and secures rel on SetContent`, () => {
    const editor = hook.editor();
    editor.settings.allow_unsafe_link_target = false;
    editor.setContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>');
    TinyAssertions.assertContent(editor, '<p><a href="http://www.google.com" target="_blank" rel="alternate nofollow noopener">Google</a></p>');
  });

  it('TBA: allow_unsafe_link_target=false: proper option selected for defined rel_list', async () => {
    const editor = hook.editor();
    editor.settings.allow_unsafe_link_target = false;
    editor.settings.rel_list = [
      { title: 'Lightbox', value: 'lightbox' },
      { title: 'Test rel', value: 'alternate nofollow' },
      { title: 'Table of contents', value: 'toc' }
    ];
    editor.setContent('<a href="http://www.google.com" target="_blank" rel="nofollow alternate">Google</a>');
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
