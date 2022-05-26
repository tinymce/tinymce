import { RealClipboard, RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyApis, TinyAssertions, TinyHooks, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';

const hook = TinyHooks.bddSetup<Editor>({
  base_url: '/project/tinymce/js/tinymce',
  toolbar: false,
  statusbar: false
}, []);

describe('webdriver.tinymce.core.paste.CopyAndPaste', () => {
  it('TINY-7719: Test wrapped elements are preserved in copy and paste', async () => {
    const editor = hook.editor();
    const ui = TinyUi(editor);
    const api = TinyApis(editor);

    editor.setContent(
      '<pre>abc</pre>' +
      '<h1>something</h1>' +
      '<p>abc def</p>'
    );
    api.setSelection([ 0, 0 ], 0, [ 0, 0 ], 3);
    ui.clickOnMenu('button:contains("Edit")');
    await ui.pWaitForUi('*[role="menu"]');
    await RealMouse.pClickOn('div[title="Copy"]');
    api.setSelection([ 1, 0 ], 0, [ 1, 0 ], 3);
    await RealClipboard.pPaste('iframe => body => h1');
    TinyAssertions.assertContent(editor,
      '<pre>abc</pre>\n' +
      '<pre>abc</pre>\n' +
      '<h1>ething</h1>\n' +
      '<p>abc def</p>'
    );

  });
});
