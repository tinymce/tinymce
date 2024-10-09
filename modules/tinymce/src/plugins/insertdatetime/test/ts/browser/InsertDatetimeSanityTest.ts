import { ApproxStructure, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/insertdatetime/Plugin';

describe('browser.tinymce.plugins.insertdatetime.InsertDatetimeSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'insertdatetime',
    toolbar: 'insertdatetime',
    insertdatetime_element: true,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  it('TBA: Click on Insertdatetime button and select the first item from the drop down menu. Assert date time is inserted', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, '[aria-haspopup="true"]');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
    TinyUiActions.clickOnUi(editor, '[role="menu"] [role="menuitemradio"]:first');

    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('time', {})
            ]
          })
        ]
      });
    }));
  });

  it('TINY-11264: Insert date time should not insert or update time element in readonly mode', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, '[aria-haspopup="true"]');
    await TinyUiActions.pWaitForUi(editor, '[role="menu"]');
    TinyUiActions.clickOnUi(editor, '[role="menu"] [role="menuitemradio"]:first');

    editor.mode.set('readonly');
    const content = editor.getContent();
    await Waiter.pWait(100);
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.execCommand('mceInsertTime');

    TinyAssertions.assertContent(editor, content);
  });
});
