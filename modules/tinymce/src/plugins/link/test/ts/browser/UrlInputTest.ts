import { FocusTools } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions, TinyContentActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.UrlInputTest', () => {

  const platform = PlatformDetection.detect();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pOpenLinkDialogWithKeyboard = async (editor: Editor) => {
    TinyContentActions.keystroke(editor, 'K'.charCodeAt(0), platform.os.isMacOS() ? { meta: true } : { ctrl: true });
    await TinyUiActions.pWaitForDialog(editor);
  };

  it('TBA: insert url by typing', async () => {
    const editor = hook.editor();
    await TestLinkUi.pOpenLinkDialog(editor);
    const focused = FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://www.test.com/');
    TestLinkUi.fireEvent(focused, 'input');
    TestLinkUi.assertDialogContents({
      href: 'http://www.test.com/',
      text: 'http://www.test.com/'
    });
    TinyUiActions.closeDialog(editor);
  });

  it('TINY-2884: insert url by keyboard shortcut', async () => {
    const editor = hook.editor();
    await pOpenLinkDialogWithKeyboard(editor);
    const focused = FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://www.test.com/');
    TestLinkUi.fireEvent(focused, 'input');
    TestLinkUi.assertDialogContents({
      href: 'http://www.test.com/',
      text: 'http://www.test.com/'
    });
    TinyUiActions.closeDialog(editor);
  });
});
