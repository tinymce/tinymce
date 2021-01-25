import { FocusTools, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { Css, SugarBody, SugarDocument, SugarElement, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { fakeEvent } from '../module/Helpers';

describe('browser.tinymce.plugins.charmap.DialogHeightTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'charmap',
    toolbar: 'charmap',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ], true);

  const tabPanelHeight = (tabpanel: SugarElement<Element>) => Css.getRaw(tabpanel, 'height').getOrDie('tabpanel has no height');

  it('TBA: Search for items, dialog height should not change when fewer items returned', async () => {
    const editor = hook.editor();
    const body = SugarBody.body();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on', doc, 'input');

    const tabPanel = UiFinder.findIn(body, '[role="dialog"] [role="tabpanel"]').getOrDie();
    const oldHeight = tabPanelHeight(tabPanel);
    const input = FocusTools.setActiveValue(doc, '.');
    fakeEvent(input, 'input');
    // need to wait until '.tox-collection__group' has no children
    await UiFinder.pWaitForState('Wait for search to finish', body, '[role="dialog"] .tox-collection__group', (e) => Traverse.childNodesCount(e) === 0);
    const newHeight = tabPanelHeight(tabPanel);
    assert.equal(parseInt(newHeight, 10), parseInt(oldHeight, 10), 'New height and old height differ');
  });
});
