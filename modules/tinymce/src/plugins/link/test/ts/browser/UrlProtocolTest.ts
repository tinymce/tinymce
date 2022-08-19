import { FocusTools, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.UrlProtocolTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pTestProtocolConfirm = async (editor: Editor, url: string, expectedProtocol: string) => {
    editor.setContent('<p>Something</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length);
    await TestLinkUi.pOpenLinkDialog(editor);

    FocusTools.setActiveValue(SugarDocument.getDocument(), url);
    TestLinkUi.assertDialogContents({
      href: url,
      text: 'Something',
      title: '',
      target: ''
    });
    await TestLinkUi.pClickSave(editor);
    await TinyUiActions.pWaitForDialog(editor, '[role="dialog"].tox-confirm-dialog');
    await TestLinkUi.pClickConfirmYes(editor);
    await TestLinkUi.pAssertContentPresence(editor, { [`a[href="${expectedProtocol}${url}"]:contains("Something")`]: 1 });
  };

  const pTestNoProtocolConfirm = async (editor: Editor, url: string) => {
    editor.setContent('<p>Something</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length);
    await TestLinkUi.pOpenLinkDialog(editor);

    FocusTools.setActiveValue(SugarDocument.getDocument(), url);
    TestLinkUi.assertDialogContents({
      href: url,
      text: 'Something',
      title: '',
      target: ''
    });
    await TestLinkUi.pClickSave(editor);
    UiFinder.notExists(SugarBody.body(), '[role="dialog"]');
    await TestLinkUi.pAssertContentPresence(editor, { [`a[href="${url}"]:contains("Something")`]: 1 });
  };

  it('TBA: Test regex for non relative ftp link', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'ftp://testftp.com');
  });

  it('TBA: Test new regex for non relative http link', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'http://testhttp.com');
    await pTestNoProtocolConfirm(editor, 'https://testhttp.com');
  });

  it('TBA: Test regex for non relative link with no protocol', async () => {
    const editor = hook.editor();
    await pTestProtocolConfirm(editor, 'www.http.com', 'https://');
    await pTestProtocolConfirm(editor, 'www3.http.com', 'https://');
  });

  it('TBA: Test regex for relative link', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'test.jpg');
  });

  it('TBA: Test regex for anchor link', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, '#test');
  });

  it('TBA: Test regex for email link with mailto:', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'mailto:no-reply@example.com');
  });

  it('TBA: Test regex for email link', async () => {
    const editor = hook.editor();
    await pTestProtocolConfirm(editor, 'no-reply@example.com', 'mailto:');
  });

  it('TBA: Test regex for path with www', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'www-example.jpg');
  });

  it('TINY-5941: Test regex for path with @', async () => {
    const editor = hook.editor();
    await pTestNoProtocolConfirm(editor, 'imgs/test@2xdpi.jpg');
  });
});
