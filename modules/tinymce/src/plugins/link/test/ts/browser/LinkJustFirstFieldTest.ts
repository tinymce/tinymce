import { FocusTools, Keys } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.JustFirstFieldTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const doc = SugarDocument.getDocument();

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  it('TBA: Checking only choosing link and submitting works', async () => {
    const editor = hook.editor();
    editor.execCommand('mceLink');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Selector should be in first field of dialog', doc, '.tox-dialog input');
    const focused = FocusTools.setActiveValue(doc, 'http://goo');
    TestLinkUi.fireEvent(focused, 'input');
    TinyUiActions.keydown(editor, Keys.enter());
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://goo"]': 1
    });
  });
});
