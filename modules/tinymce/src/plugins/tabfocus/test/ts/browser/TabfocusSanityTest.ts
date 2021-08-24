import { FocusTools, Keys } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { SugarDocument } from '@ephox/sugar';
import { TinyContentActions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/tabfocus/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.tabfocus.TabfocusSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'tabfocus',
    tabfocus_elements: 'tempinput1',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme, Plugin ], true);

  before(() => {
    const editor = hook.editor();
    const container = editor.getContainer();
    const input1 = document.createElement('input');
    input1.id = 'tempinput1';
    container.parentNode.insertBefore(input1, container);
  });

  after(() => {
    const input1 = document.getElementById('tempinput1');
    input1.parentNode.removeChild(input1);
  });

  it('TBA: Add an input field outside the editor, focus on the editor, press the tab key and assert focus shifts to the input field', async () => {
    const editor = hook.editor();
    FocusTools.isOnSelector('iframe is focused', SugarDocument.getDocument(), 'iframe');
    TinyContentActions.keystroke(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Wait for focus to be on input', SugarDocument.getDocument(), '#tempinput1');
  });
});
