import { FocusTools } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SugarDocument } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { fakeEvent } from '../module/Helpers';

describe('browser.tinymce.plugins.charmap.CharmapUserDefinedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    charmap: [[ 'A'.charCodeAt(0), 'A' ]],
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  it('TBA: User defined charmap', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should have moved to input', doc, 'input');
    const input = FocusTools.setActiveValue(doc, 'A');
    fakeEvent(input, 'input');
    await TinyUiActions.pWaitForUi(editor, '.tox-collection .tox-collection__item-icon:contains(A)');
  });
});
