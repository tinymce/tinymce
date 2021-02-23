import { FocusTools, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional, Type } from '@ephox/katamari';
import { TinyDom, TinyHooks, TinyUiActions } from '@ephox/mcagar';
import { SelectorFilter, SugarElement, SugarShadowDom } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';

describe('browser.tinymce.themes.silver.editor.color.ColorPickerSanityTest', () => {
  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        base_url: '/project/tinymce/js/tinymce'
      }, [ Theme ]);
      const dialogSelector = 'div[role="dialog"]';
      let currentColor = '';

      const getBody = (editor: Editor) =>
        SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor)));

      const setColor = (hexOpt: Optional<string>) => {
        hexOpt.each((hex) => {
          currentColor = hex;
        });
      };

      const fireEvent = (elem: SugarElement<Node>, event: string) => {
        let evt: Event;
        if (Type.isFunction(Event)) {
          evt = new Event(event, {
            bubbles: true,
            cancelable: true
          });
        } else { // support IE
          evt = document.createEvent('Event');
          evt.initEvent(event, true, true);
        }
        elem.dom.dispatchEvent(evt);
      };

      const assertColor = (expected: string) => {
        assert.equal(currentColor, expected, 'Asserting current colour is ' + expected);
      };

      const setHex = (hex: string) => (editor: Editor) => {
        const docBody = getBody(editor);
        const inputs = SelectorFilter.descendants<HTMLInputElement>(docBody, dialogSelector + ' input');
        const hexInput = inputs[inputs.length - 1];
        hexInput.dom.value = hex;
        fireEvent(hexInput, 'input');
      };

      const pOpenDialog = async (editor: Editor) => {
        const dialog = ColorSwatch.colorPickerDialog(editor);
        dialog(setColor, '#ffffff');
        await TinyUiActions.pWaitForDialog(editor);
      };

      const assertColorWhite = () => assertColor('#ffffff');
      const assertColorBlack = () => assertColor('#000000');
      const setHexWhite = setHex('ffffff');
      const setHexBlack = setHex('000000');

      const submit = async (editor: Editor) => {
        const docBody = getBody(editor);
        FocusTools.setFocus(docBody, dialogSelector);
        await Waiter.pTryUntil('Button is not disabled', () => UiFinder.notExists(docBody, 'button.tox-button:contains("Save")[disabled]'));
        TinyUiActions.submitDialog(editor);
        return docBody;
      };

      const pSubmitDialog = async (editor: Editor) => {
        const docBody = await submit(editor);
        await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(docBody, dialogSelector));
      };

      const pSubmitDialogWithExpectedAlert = async (editor: Editor, expectedAlert: string) => {
        const docBody = await submit(editor);
        await Waiter.pTryUntil('Alert should show correct message', () => UiFinder.exists(docBody, `p:contains(${expectedAlert})`));
        // Close alert
        TinyUiActions.clickOnUi(editor, 'button[title="OK"]');
        TinyUiActions.cancelDialog(editor, dialogSelector);
      };

      const pCancelDialog = async (editor: Editor) => {
        const docBody = getBody(editor);
        FocusTools.setFocus(docBody, dialogSelector);
        TinyUiActions.cancelDialog(editor);
        await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(docBody, dialogSelector));
      };

      it('TBA: Open dialog, click Save and assert color is white', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        await pSubmitDialog(editor);
        assertColorWhite();
      });

      it('TBA: Open dialog, pick a color, click Save and assert color changes to picked color', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        setHexBlack(editor);
        await pSubmitDialog(editor);
        assertColorBlack();
      });

      it('TBA: Open dialog, pick a different color, click Cancel and assert color does not change', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        setHexWhite(editor);
        await pCancelDialog(editor);
        assertColorBlack();
      });

      it('TINY-6952: Submitting an invalid hex color code will show an alert with an error message', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        setHex('invalid')(editor);
        await pSubmitDialogWithExpectedAlert(editor, 'Invalid hex color code: #invalid');
      });
    });
  });
});
