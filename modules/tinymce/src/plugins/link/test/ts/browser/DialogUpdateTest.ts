import { FileInput, Mouse, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody, Value } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Plugin from 'tinymce/plugins/link/Plugin';

const pTriggerUpload = async (editor: Editor, fileName: string) => {
  const file = new window.File([ 'test content' ], fileName, { type: 'text/plain' });
  await FileInput.pRunOnPatchedFileInput([ file ], async () => {
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const button = UiFinder.findIn(dialog, 'button:contains("Browse for a file")').getOrDie();
    Mouse.click(button);
  });
};

const assertInputValue = (labelText: string, expected: string) => {
  const element = UiFinder.findTargetByLabel<HTMLInputElement>(SugarBody.body(), labelText).getOrDie();
  const value = Value.get(element);
  assert.equal(value, expected, `input value should be ${expected}`);
};

describe('browser.tinymce.plugins.link.DialogUpdateTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce',
    files_upload_handler: (blobInfo: BlobInfo, _progress: (p: number) => void) => new Promise((success) => {
      success({ url: `url:${blobInfo.filename()}`, fileName: `filename:${blobInfo.filename()}` });
    }),
    documents_file_types: [
      { mimeType: 'application/msword', extensions: [ 'doc' ] },
      { mimeType: 'text/plain', extensions: [ 'txt' ] }
    ]
  }, [ Plugin ]);

  it('TINY-13278: if `files_upload_handler` and `documents_file_types` are defined the dialog should have an upload tab', async () => {
    const editor = hook.editor();
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    UiFinder.exists(SugarBody.body(), 'div[role="tab"]:contains("Upload")');
    TinyUiActions.closeDialog(editor);
  });

  it('TINY-13278: uploading a file should set "URL", "Text to display" and "Title" fields', async () => {
    const editor = hook.editor();
    editor.resetContent('');
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(SugarBody.body(), 'div[role="tab"]:contains("Upload")');
    const fileName = 'test.txt';
    await pTriggerUpload(editor, fileName);
    // this is needed to wait that the modal is updated
    await UiFinder.pWaitFor<HTMLInputElement>('label with text URL should be loaded', SugarBody.body(), 'label:contains("URL")');
    assertInputValue('URL', `url:${fileName}`);
    assertInputValue('Text to display', `filename:${fileName}`);
    assertInputValue('Title', `filename:${fileName}`);

    TinyUiActions.cancelDialog(editor);
  });

  it('TINY-13278: it should be possible to upload new file overwriting the current fields', async () => {
    const editor = hook.editor();
    editor.resetContent('');
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(SugarBody.body(), 'div[role="tab"]:contains("Upload")');
    const fileName = 'test.txt';
    await pTriggerUpload(editor, fileName);
    // this is needed to wait that the modal is updated
    await UiFinder.pWaitFor<HTMLInputElement>('label with text URL should be loaded', SugarBody.body(), 'label:contains("URL")');
    assertInputValue('URL', `url:${fileName}`);
    assertInputValue('Text to display', `filename:${fileName}`);
    assertInputValue('Title', `filename:${fileName}`);

    TinyUiActions.submitDialog(editor);

    await UiFinder.pWaitFor<HTMLInputElement>('link should be created', TinyDom.body(editor), 'a');
    TinySelections.select(editor, 'a', []);

    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    Mouse.clickOn(SugarBody.body(), 'div[role="tab"]:contains("Upload")');

    const newFileName = 'test2.txt';
    await pTriggerUpload(editor, newFileName);
    // this is needed to wait that the modal is updated
    await UiFinder.pWaitFor<HTMLInputElement>('label with text URL should be loaded', SugarBody.body(), 'label:contains("URL")');
    assertInputValue('URL', `url:${newFileName}`);
    assertInputValue('Text to display', `filename:${newFileName}`);
    assertInputValue('Title', `filename:${newFileName}`);
    TinyUiActions.cancelDialog(editor);
  });

  context('TINY-13278: no `documents_file_types` or no `files_upload_handler` or `link_uploadtab: false`', () => {
    const cases = [
      { files_upload_handler: false, documents_file_types: true },
      { files_upload_handler: true, documents_file_types: false },
      { files_upload_handler: false, documents_file_types: false },
      { files_upload_handler: true, documents_file_types: true, link_uploadtab: false }
    ];
    Arr.each(cases, (c) => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        plugins: 'link',
        toolbar: 'link',
        base_url: '/project/tinymce/js/tinymce',
        ...(c.files_upload_handler ? { files_upload_handler: (blobInfo: BlobInfo, _progress: (p: number) => void) => new Promise((success) => {
          success({ url: `url:${blobInfo.filename()}`, fileName: `filename:${blobInfo.filename()}` });
        }) } : {}),
        ...(c.documents_file_types ? { documents_file_types: [
          { mimeType: 'application/msword', extensions: [ 'doc' ] },
          { mimeType: 'text/plain', extensions: [ 'txt' ] }
        ] } : {}),
        link_uploadtab: c.link_uploadtab
      }, [ Plugin ]);

      it(`TINY-13278: if files_upload_handler or documents_file_types are not defined the dialog should not have an upload tab (${JSON.stringify(c)})`, async () => {
        const editor = hook.editor();
        editor.execCommand('mceLink');
        await TinyUiActions.pWaitForDialog(editor);
        UiFinder.notExists(SugarBody.body(), 'div[role="tab"]:contains("Upload")');
        TinyUiActions.closeDialog(editor);
      });
    });
  });
});
