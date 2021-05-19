import { FocusTools, RealKeys, UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from '@ephox/mcagar';
import { Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.throbber.ThrobberTabbingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ]);

  before(() => {
    const editor = hook.editor();
    const input = SugarElement.fromHtml('<input id="tempInput" />');
    Insert.after(TinyDom.targetElement(editor), input);
  });

  after(() => {
    Remove.remove(SelectorFind.descendant(SugarBody.body(), '#tempInput').getOrDie());
  });

  const pAssertThrobberFocus = () =>
    FocusTools.pTryOnSelector('Throbber has focus', SugarDocument.getDocument(), 'div.tox-throbber__busy-spinner');

  const pAssertEditorFocus = () =>
    FocusTools.pTryOnSelector('Editor iframe has focus', SugarDocument.getDocument(), 'iframe.tox-edit-area__iframe');

  const pEnableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement> = pAssertThrobberFocus) => {
    editor.setProgressState(true);
    await UiFinder.pWaitForVisible('Wait for throbber to show', SugarBody.body(), '.tox-throbber');
    await pAssertFocus();
  };

  const pDisableThrobber = async (editor: Editor, pAssertFocus: () => Promise<SugarElement> = pAssertEditorFocus) => {
    editor.setProgressState(false);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
    await pAssertFocus();
  };

  it('TINY-7373: should be able to tab into editor if throbber is disabled', async () => {
    const editor = hook.editor();
    FocusTools.setFocus(SugarBody.body(), '#tempInput');
    await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
    await pAssertEditorFocus();
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should take focus if editor is tabbed into and throbber is enabled', async () => {
    const editor = hook.editor();
    FocusTools.setFocus(SugarBody.body(), '#tempInput');
    pEnableThrobber(editor, () => FocusTools.pTryOnSelector('Focus should remain on input', SugarDocument.getDocument(), '#tempInput'));

    // Make sure throbber gets focus if the editor is tabbed into
    await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
    await pAssertThrobberFocus();

    await pDisableThrobber(editor);
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should not be able to tab out of the throbber if it has focus', async () => {
    const editor = hook.editor();
    FocusTools.setFocus(SugarBody.body(), '#tempInput');
    pEnableThrobber(editor, () => FocusTools.pTryOnSelector('Focus should remain on input', SugarDocument.getDocument(), '#tempInput'));

    // Make sure throbber gets focus if the editor is tabbed into
    await RealKeys.pSendKeysOn('#tempInput', [ RealKeys.combo({}, '\u0009') ] );
    await pAssertThrobberFocus();

    // Make sure cannot tab out of the throbber
    await RealKeys.pSendKeysOn('div.tox-throbber__busy-spinner', [ RealKeys.combo({ shiftKey: true }, '\u0009') ]);
    await pAssertThrobberFocus();
    await RealKeys.pSendKeysOn('div.tox-throbber__busy-spinner', [ RealKeys.combo({}, '\u0009') ]);
    await pAssertThrobberFocus();

    await pDisableThrobber(editor);
    assert.isTrue(editor.hasFocus());
  });
});
