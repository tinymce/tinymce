import { FocusTools, RealKeys, UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Insert, Remove, SelectorFind, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as UiUtils from '../../module/UiUtils';

describe('webdriver.tinymce.themes.silver.throbber.ThrobberTabbingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  before(() => {
    const editor = hook.editor();
    const target = TinyDom.targetElement(editor);
    const inputBefore = SugarElement.fromHtml('<div><input id="beforeInput" /></div>');
    const inputAfter = SugarElement.fromHtml('<div><input id="afterInput" /></div>');
    Insert.before(target, inputBefore);
    Insert.append(SugarBody.body(), inputAfter);
  });

  after(() => {
    Arr.each([ '#beforeInput', '#afterInput' ], (selector) => {
      Remove.remove(SelectorFind.descendant(SugarBody.body(), selector).getOrDie());
    });
  });

  const pAssertFocus = (label: string, selector: string) =>
    FocusTools.pTryOnSelector(label, SugarDocument.getDocument(), selector);

  const pAssertThrobberFocus = () =>
    pAssertFocus('Throbber has focus', 'div.tox-throbber__busy-spinner');

  const pAssertEditorFocus = (editor: Editor) => () =>
    pAssertFocus('Editor has focus', editor.inline ? 'div.mce-edit-focus' : 'iframe.tox-edit-area__iframe');

  const pAssertInputFocus = (before: boolean) => () =>
    pAssertFocus('Input has focus', before ? '#beforeInput' : '#afterInput');

  const pPressTab = (selector: string, shiftKey?: boolean) =>
    RealKeys.pSendKeysOn(selector, [ RealKeys.combo({ shiftKey }, '\u0009') ] );

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

  const pFocusAndWaitForRender = async (selector: string) => {
    FocusTools.setFocus(SugarBody.body(), selector);
    await UiUtils.pWaitForEditorToRender();
  };

  it('TINY-7373: should be able to tab into editor if throbber is disabled', async () => {
    const editor = hook.editor();
    await pFocusAndWaitForRender('#beforeInput');
    await pPressTab('#beforeInput');
    await pAssertEditorFocus(editor)();
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should take focus if editor is tabbed into and throbber is enabled', async () => {
    const editor = hook.editor();
    await pFocusAndWaitForRender('#beforeInput');
    await pEnableThrobber(editor, pAssertInputFocus(true));

    // Make sure throbber gets focus if the editor is tabbed into
    await pPressTab('#beforeInput');
    await pAssertThrobberFocus();

    await pDisableThrobber(editor, pAssertEditorFocus(editor));
    assert.isTrue(editor.hasFocus());
  });

  it('TINY-7373: should be able to Tab out of the throbber if it has focus', async () => {
    const editor = hook.editor();
    await pFocusAndWaitForRender('#beforeInput');
    await pEnableThrobber(editor, pAssertInputFocus(true));

    await pPressTab('#beforeInput');
    await pAssertThrobberFocus();

    await pPressTab('div.tox-throbber__busy-spinner');
    await pAssertInputFocus(false)();

    await pDisableThrobber(editor, pAssertInputFocus(false));
    assert.isFalse(editor.hasFocus());
  });

  it('TINY-7373: should be able to Shift+Tab out of the throbber if it has focus', async function () {
    // Automated test doesn't work on Safari but works manually
    if (Env.browser.isSafari()) {
      this.skip();
    }

    const editor = hook.editor();
    await pFocusAndWaitForRender('#afterInput');
    await pEnableThrobber(editor, pAssertInputFocus(false));

    await pPressTab('#afterInput', true);
    await pAssertThrobberFocus();

    await pPressTab('div.tox-throbber__busy-spinner', true);
    await pAssertInputFocus(true)();

    await pDisableThrobber(editor, pAssertInputFocus(true));
    assert.isFalse(editor.hasFocus());
  });
});
