import { describe, it, context, before } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.DefaultLinkProtocolTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  context('link_default_protocol: "http"', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('link_default_protocol', 'http');
    });

    it('TBA: www-urls are prompted to add http:// prefix, accept', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")');
      await TestLinkUi.pClickConfirmYes(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="http://www.google.com"]': 1 });
    });

    it('TBA: www-urls are prompted to add http:// prefix, cancel', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")');
      await TestLinkUi.pClickConfirmNo(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="www.google.com"]': 1 });
    });

    it('TBA: other urls are not prompted to add http:// prefix', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="google.com"]': 1 });
    });
  });

  context('link_default_protocol: "https"', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('link_default_protocol', 'https');
    });

    it('TBA: www-urls are prompted to add https:// prefix, accept', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")');
      await TestLinkUi.pClickConfirmYes(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="https://www.google.com"]': 1 });
    });

    it('TBA: www-urls are prompted to add https:// prefix, cancel', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")');
      await TestLinkUi.pClickConfirmNo(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="www.google.com"]': 1 });
    });

    it('TBA: other urls are not prompted to add https:// prefix', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="google.com"]': 1 });
    });
  });
});
