import { describe, it, context, before } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.AssumeExternalTargetsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  context('Default setting', () => {
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

    it('TBA: other urls are not prompted', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="google.com"]': 1 });
    });
  });

  context('link_assume_external_targets: true', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('link_assume_external_targets', true);
    });

    it('TBA: www-urls are prompted to add https:// prefix', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")');
      await TestLinkUi.pClickConfirmYes(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="https://www.google.com"]': 1 });
    });

    it('TBA: other urls are prompted to add https:// prefix', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")');
      await TestLinkUi.pClickConfirmYes(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="https://google.com"]': 1 });
    });

    it('TBA: url not updated when prompt canceled', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TinyUiActions.pWaitForPopup(editor, 'p:contains("The URL you entered seems to be an external link. Do you want to add the required https:// prefix?")');
      await TestLinkUi.pClickConfirmNo(editor);
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="google.com"]': 1 });
    });
  });

  context('link_assume_external_targets: http', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('link_assume_external_targets', 'http');
    });

    it('TBA: add http:// prefix to www-urls', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="http://www.google.com"]': 1 });
    });

    it('TBA: add http:// prefix to other urls', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="http://google.com"]': 1 });
    });
  });

  context('link_assume_external_targets: https', () => {
    before(() => {
      const editor = hook.editor();
      editor.options.set('link_assume_external_targets', 'https');
    });

    it('TBA: add https:// prefix to www-urls', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'www.google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="https://www.google.com"]': 1 });
    });

    it('TBA: add https:// prefix to other urls', async () => {
      const editor = hook.editor();
      await TestLinkUi.pInsertLink(editor, 'google.com');
      await TestLinkUi.pAssertContentPresence(editor, { 'a': 1, 'a[href="https://google.com"]': 1 });
    });
  });
});
