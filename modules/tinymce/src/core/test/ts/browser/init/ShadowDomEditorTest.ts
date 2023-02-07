import { UiFinder } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';
import { Insert, Remove, SelectorFilter, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
import { McEditor, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.ShadowDomEditorTest', () => {
  before(function () {
    if (!SugarShadowDom.isSupported()) {
      this.skip();
    }
  });

  const isSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.min.css');
  const isShadowDomSkin = (ss: StyleSheet) => ss.href !== null && Strings.contains(ss.href, 'skin.shadowdom.min.css');

  Arr.each([
    { type: 'normal', settings: { }, numSinks: 1 },
    { type: 'inline', settings: { inline: true }, numSinks: 1 },
    { type: 'normal-split-ui-mode', settings: { ui_mode: 'split' }, numSinks: 2 },
    { type: 'inline-split-ui-mode', settings: { ui_mode: 'split', inline: true }, numSinks: 2 }
  ], (tester) => {
    context(`${tester.type} editor`, () => {
      const hook = TinyHooks.bddSetupInShadowRoot<Editor>({
        toolbar_sticky: false,
        base_url: '/project/tinymce/js/tinymce',
        ...tester.settings
      }, []);

      it('Skin stylesheets should be loaded in ShadowRoot when editor is in ShadowRoot', () => {
        assert.isTrue(Arr.exists(hook.shadowRoot().dom.styleSheets, isSkin), 'There should be a skin stylesheet in the ShadowRoot');
        assert.isTrue(Arr.exists(document.styleSheets, isShadowDomSkin), 'There should be a shadowdom specific skin stylesheet in the document');
      });

      it('aux div should be within shadow root', async () => {
        const editor = hook.editor();
        const shadowRoot = hook.shadowRoot();
        editor.focus();
        editor.nodeChanged();
        await UiFinder.pWaitForVisible('Wait for editor to be visible', shadowRoot, '.tox-editor-header');
        assert.lengthOf(SelectorFilter.descendants(SugarBody.body(), '.tox-tinymce-aux'), 0, 'Should be no aux divs in the document');
        assert.lengthOf(
          SelectorFilter.descendants(shadowRoot, '.tox-tinymce-aux'),
          tester.numSinks,
          `Should be ${tester.numSinks} aux div in the shadow root`
        );
      });
    });

    context(`Multiple ${tester.type} editors`, () => {
      const mkEditor = (sr: SugarElement<ShadowRoot>) => {
        const editorDiv = SugarElement.fromTag('div', document);
        Insert.append(sr, editorDiv);
        return McEditor.pFromElement(editorDiv, {
          base_url: '/project/tinymce/js/tinymce',
          ...tester.settings
        });
      };

      it('Only one skin stylesheet should be loaded for multiple editors in a ShadowRoot', async () => {
        const shadowHost = SugarElement.fromTag('div', document);
        Insert.append(SugarBody.body(), shadowHost);
        const sr = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));

        const editor1 = await mkEditor(sr);
        const editor2 = await mkEditor(sr);
        const editor3 = await mkEditor(sr);

        assert.lengthOf(Arr.filter(sr.dom.styleSheets, isSkin), 1, 'There should only be 1 skin stylesheet in the ShadowRoot');

        McEditor.remove(editor1);
        McEditor.remove(editor2);
        McEditor.remove(editor3);
        Remove.remove(shadowHost);
      });
    });
  });
});
