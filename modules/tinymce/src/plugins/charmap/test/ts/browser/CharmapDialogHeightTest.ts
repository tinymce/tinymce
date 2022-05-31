import { FocusTools, Keys, UiFinder } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Css, SugarElement, SugarShadowDom, Traverse, Value } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/charmap/Plugin';

import { fakeEvent } from '../module/Helpers';

describe('browser.tinymce.plugins.charmap.DialogHeightTest', () => {
  Arr.each([
    { label: 'IFrame Editor', setup: TinyHooks.bddSetupLight },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot },
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        plugins: 'charmap',
        toolbar: 'charmap',
        base_url: '/project/tinymce/js/tinymce'
      }, [ Plugin ], true);

      before(() => {
        // Make the shadow host focusable
        const target = TinyDom.targetElement(hook.editor());
        SugarShadowDom.getShadowRoot(target).each((sr) => {
          const host = SugarShadowDom.getShadowHost(sr);
          Attribute.set(host, 'tabindex', 1);
        });
      });

      const tabPanelHeight = (tabpanel: SugarElement<Element>) => Css.getRaw(tabpanel, 'height').getOrDie('tabpanel has no height');

      const type = (doc: SugarElement<Document | ShadowRoot>, text: string) => {
        const input = FocusTools.getFocused(doc).getOrDie() as SugarElement<HTMLInputElement>;
        Value.set(input, Value.get(input) + text);
        fakeEvent(input, 'input');
      };

      it('TBA: Search for items, dialog height should not change when fewer items returned', async () => {
        const editor = hook.editor();
        const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));
        const body = SugarShadowDom.getContentContainer(root);

        TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
        await TinyUiActions.pWaitForDialog(editor);
        await FocusTools.pTryOnSelector('Focus should start on', root, 'input');

        const tabPanel = UiFinder.findIn(body, '[role="dialog"] [role="tabpanel"]').getOrDie();
        const oldHeight = tabPanelHeight(tabPanel);
        type(root, '.');
        // need to wait until '.tox-collection__group' has no children
        await UiFinder.pWaitForState('Wait for search to finish', body, '[role="dialog"] .tox-collection__group', (e) => Traverse.childNodesCount(e) === 0);
        const newHeight = tabPanelHeight(tabPanel);
        assert.equal(parseInt(newHeight, 10), parseInt(oldHeight, 10), 'New height and old height differ');
        TinyUiActions.keyup(editor, Keys.escape());
      });

      it('TINY-6904: Focus should remain while typing', async () => {
        const editor = hook.editor();
        const root = SugarShadowDom.getRootNode(TinyDom.targetElement(editor));

        TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Special character"]');
        await TinyUiActions.pWaitForDialog(editor);
        await FocusTools.pTryOnSelector('Focus should start on', root, 'input');

        type(root, 'a');
        await FocusTools.pTryOnSelector('Focus is still on input', root, 'input');
        type(root, 'b');
        await FocusTools.pTryOnSelector('Focus is still on input', root, 'input');
        TinyUiActions.keyup(editor, Keys.escape());
      });
    });
  });
});
