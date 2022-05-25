import { GeneralSteps, Pipeline, RealClipboard, RealMouse, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyHooks, TinyUi } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';

const hook = TinyHooks.bddSetup<Editor>({
  base_url: '/project/tinymce/js/tinymce',
  toolbar: false,
  statusbar: false
}, []);

UnitTest.asynctest('TINY-7719 :: Test wrapped element are preserved in copy and paste', (success, failure) => {
  const editor = hook.editor();
  const ui = TinyUi(editor);
  const api = TinyApis(editor);

  const sTestVersion = () => GeneralSteps.sequence([
    api.sSetContent(
      '<pre>abc</pre>' +
      '<h1>something</h1>' +
      '<p>abc def</p>'
    ),
    api.sSetSelection([ 0, 0 ], 0, [ 0, 0 ], 3),
    ui.sClickOnMenu('Click Edit menu', 'button:contains("Edit")'),
    ui.sWaitForUi('Wait for dropdown', '*[role="menu"]'),
    RealMouse.sClickOn('div[title="Copy"]'),
    api.sSetSelection([ 1, 0 ], 0, [ 1, 0 ], 3),
    RealClipboard.sPaste('iframe => body => h1'),
    Waiter.sTryUntil(
      'Cut is async now, so need to wait for content',
      api.sAssertContent(
        '<pre>abc</pre>\n' +
        '<pre>abc</pre>\n' +
        '<h1>ething</h1>\n' +
        '<p>abc def</p>'
      )
    )
  ]);

  Pipeline.async({}, [
    sTestVersion()
  ], success, failure);
});
