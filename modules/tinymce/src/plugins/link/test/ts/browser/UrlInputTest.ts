import { FocusTools } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.UrlInputTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

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
});
