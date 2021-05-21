import { FocusTools, RealKeys, UiFinder } from '@ephox/agar';
import { after, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/mcagar';
import { Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.throbber.ThrobberTabbingTest', () => {
  before(() => {
    const input = SugarElement.fromHtml('<input id="tempInput" />');
    Insert.append(SugarBody.body(), input);
  });

  after(() => {
    Remove.remove(SelectorFind.descendant(SugarBody.body(), '#tempInput').getOrDie());
  });

  const pAssertFocus = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(label, SugarDocument.getDocument(), selector);

  const pAssertThrobberFocus = () =>
    pAssertFocus('Throbber has focus', 'div.tox-throbber__busy-spinner');

  const pAssertEditorFocus = (editor: Editor) => () =>
    pAssertFocus('Editor has focus', editor.inline ? 'div.mce-edit-focus' : 'iframe.tox-edit-area__iframe');

  const pAsserInputFocus = () =>
    pAssertFocus('Input has focus', '#tempInput');

  const pEnableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
    editor.setProgressState(true);
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    await pAssertFocus();
  };

  const pDisableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement>) => {
    editor.setProgressState(false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
    await pAssertFocus();
  };

  Arr.each([
    { label: 'Iframe editor', settings: { }},
    { label: 'Inline editor', settings: { inline: true }}
  ], (config) => {
    context(config.label, () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        ...config.settings,
        base_url: '/project/tinymce/js/tinymce'
      }, [ Theme ]);

      it('TINY-7373: should be able to tab into editor if throbber is disabled', async () => {
        const editor = hook.editor();
        FocusTools.setFocus(SugarBody.body(), '#tempInput');
        await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
        await pAssertEditorFocus(editor)();
        assert.isTrue(editor.hasFocus());
      });

      it('TINY-7373: should take focus if editor is tabbed into and throbber is enabled', async () => {
        const editor = hook.editor();
        FocusTools.setFocus(SugarBody.body(), '#tempInput');
        pEnableThrobber(editor, pAsserInputFocus);

        // Make sure throbber gets focus if the editor is tabbed into
        await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
        await pAssertThrobberFocus();

        await pDisableThrobber(editor, pAssertEditorFocus(editor));
        assert.isTrue(editor.hasFocus());
      });

      // TODO: Need to figure out if this is what we want
      it('TINY-7373: should not be able to tab out of the throbber if it has focus', async () => {
        const editor = hook.editor();
        FocusTools.setFocus(SugarBody.body(), '#tempInput');
        pEnableThrobber(editor, pAsserInputFocus);

        // Make sure throbber gets focus if the editor is tabbed into
        await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
        await pAssertThrobberFocus();

        // Make sure cannot tab out of the throbber
        await RealKeys.pSendKeysOn('div.tox-throbber__busy-spinner', [ RealKeys.combo({ shiftKey: true }, '\u0009') ]);
        await pAssertThrobberFocus();
        await RealKeys.pSendKeysOn('div.tox-throbber__busy-spinner', [ RealKeys.combo({}, '\u0009') ]);
        await pAssertThrobberFocus();

        await pDisableThrobber(editor, pAssertEditorFocus(editor));
        assert.isTrue(editor.hasFocus());
      });
    });
  });
});
