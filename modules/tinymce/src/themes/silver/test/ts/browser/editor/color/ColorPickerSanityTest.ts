import { FocusTools, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Attribute, SelectorFilter, SugarDocument, SugarElement, SugarShadowDom } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as ColorSwatch from 'tinymce/themes/silver/ui/core/color/ColorSwatch';

describe('browser.tinymce.themes.silver.editor.color.ColorPickerSanityTest', () => {
  const selectors = {
    backcolorToolbar: '[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron',
    forecolorToolbar: '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron'
  };

  Arr.each([
    { label: 'Iframe Editor', setup: TinyHooks.bddSetup },
    { label: 'Shadow Dom Editor', setup: TinyHooks.bddSetupInShadowRoot }
  ], (tester) => {
    context(`${tester.label}, Test of different color types`, () => {
      const hook = tester.setup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'forecolor backcolor',
        content_style: 'p{color: pink; background-color: hsl(120, 100%, 75%);}'
      }, []);

      it('TINY-9213: Color detected on color, background', async () => {
        const editor = hook.editor();
        editor.setContent('<p>Text</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorToolbar);
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
        const backgroundDialog = await TinyUiActions.pWaitForDialog(editor);
        const backgroundDialogResult = UiFinder.findIn<HTMLInputElement>(backgroundDialog, 'label:contains("#") + input').getOrDie();
        await Waiter.pTryUntil('Dialog should start with the right color', () => assert.equal(backgroundDialogResult.dom.value, '80FF80'));
        TinyUiActions.cancelDialog(editor);
      });

      it('TINY-9213: Color detected on color, foreground', async () => {
        const editor = hook.editor();
        editor.setContent('<p>Text</p>');
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorToolbar);
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
        const textDialog = await TinyUiActions.pWaitForDialog(editor);
        const textDialogResult = UiFinder.findIn<HTMLInputElement>(textDialog, 'label:contains("#") + input').getOrDie();
        await Waiter.pTryUntil('Dialog should start with the right color', () => assert.equal(textDialogResult.dom.value, 'FFC0CB'));
        TinyUiActions.cancelDialog(editor);
      });
    });

    context(tester.label, () => {
      const hook = tester.setup<Editor>({
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'forecolor backcolor'
      }, []);
      const dialogSelector = 'div[role="dialog"]';
      let currentColor = '';

      const getBody = (editor: Editor) =>
        SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(TinyDom.targetElement(editor)));

      const fireEvent = (elem: SugarElement<Node>, event: string) => {
        const evt = new Event(event, {
          bubbles: true,
          cancelable: true
        });
        elem.dom.dispatchEvent(evt);
      };

      const setColor = (hexOpt: Optional<string>) => {
        hexOpt.each((hex) => {
          currentColor = hex;
        });
      };

      const assertColor = (expected: string) => {
        assert.equal(currentColor, expected, 'Asserting current colour is ' + expected);
      };

      const pSetHex = (hex: string) => async (editor: Editor) => {
        const docBody = getBody(editor);
        const inputs = SelectorFilter.descendants<HTMLInputElement>(docBody, dialogSelector + ' input');
        const hexInput = inputs[inputs.length - 1];
        hexInput.dom.value = hex;
        fireEvent(hexInput, 'input');
        // Give form invalidation a chance to run (asynchronous)
        await Waiter.pWait(0);
      };

      const pOpenDialog = async (editor: Editor) => {
        const dialog = ColorSwatch.colorPickerDialog(editor);
        dialog(setColor, '#ffffff');
        await TinyUiActions.pWaitForDialog(editor);
      };

      const assertColorWhite = () => assertColor('#ffffff');
      const assertColorBlack = () => assertColor('#000000');
      const pSetHexWhite = pSetHex('ffffff');
      const pSetHexBlack = pSetHex('000000');

      const pWaitForDialogClose = async (editor: Editor) => {
        await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(getBody(editor), dialogSelector));
      };

      const pAssertExpectedAlert = async (editor: Editor, expectedAlert: string) => {
        await Waiter.pTryUntil('Alert should show correct message', () => UiFinder.exists(getBody(editor), `p:contains(${expectedAlert})`));
        // Close alert
        TinyUiActions.clickOnUi(editor, 'button:contains("OK")');
        TinyUiActions.cancelDialog(editor, dialogSelector);
      };

      const pCancelDialog = async (editor: Editor) => {
        TinyUiActions.cancelDialog(editor);
        await Waiter.pTryUntil('Dialog should close', () => UiFinder.notExists(getBody(editor), dialogSelector));
      };

      const assertAriaValues = (editor: Editor, hue: number, saturation: number, brightness: number) => {
        const palette = UiFinder.findIn(getBody(editor), '.tox-sv-palette').getOrDie();
        const slider = UiFinder.findIn(getBody(editor), '.tox-hue-slider').getOrDie();
        assert.equal(Attribute.get(palette, 'aria-valuetext'), `Saturation ${saturation}%, Brightness ${brightness}%`);
        assert.equal(Attribute.get(slider, 'aria-valuenow'), '' + hue);
      };

      it('TBA: Open dialog, click Save and assert color is white', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        TinyUiActions.submitDialog(editor);
        await pWaitForDialogClose(editor);
        assertColorWhite();
      });

      it('TBA: Open dialog, pick a color, click Save and assert color changes to picked color', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        await pSetHexBlack(editor);
        TinyUiActions.submitDialog(editor);
        await pWaitForDialogClose(editor);
        assertColorBlack();
      });

      it('TBA: Open dialog, pick black, reopen the dialog, pick a different color, click Cancel and assert color does not change', async () => {
        const editor = hook.editor();
        // Change color to black
        await pOpenDialog(editor);
        await pSetHexBlack(editor);
        assertAriaValues(editor, 120, 0, 0);
        TinyUiActions.submitDialog(editor);
        await pWaitForDialogClose(editor);
        // Change color in the dialog but cancel
        await pOpenDialog(editor);
        await pSetHexWhite(editor);
        assertAriaValues(editor, 120, 0, 100);
        await pCancelDialog(editor);
        assertColorBlack();
      });

      it('TINY-9213: Color detected on color, background', async () => {
        const editor = hook.editor();
        editor.setContent('<p style="color: #FF00FF;background-color: #00FF00;">Text</p>', { format: 'raw' });
        TinySelections.setCursor(editor, [ 0, 0 ], 2);
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorToolbar);
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
        const backgroundDialog = await TinyUiActions.pWaitForDialog(editor);
        const backgroundDialogResult = UiFinder.findIn<HTMLInputElement>(backgroundDialog, 'label:contains("#") + input').getOrDie();
        await Waiter.pTryUntil('Dialog should start with the right color', () => assert.equal(backgroundDialogResult.dom.value, '00FF00'));
        TinyUiActions.cancelDialog(editor);
      });

      it('TINY-9213: Color detected on color, foreground', async () => {
        const editor = hook.editor();
        editor.setContent('<p style="color: #FF00FF;background-color: #00FF00;">Text</p>', { format: 'raw' });
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorToolbar);
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
        const textDialog = await TinyUiActions.pWaitForDialog(editor);
        const textDialogResult = UiFinder.findIn<HTMLInputElement>(textDialog, 'label:contains("#") + input').getOrDie();
        await Waiter.pTryUntil('Dialog should start with the right color', () => assert.equal(textDialogResult.dom.value, 'FF00FF'));
        TinyUiActions.cancelDialog(editor);
      });

      it('TINY-6952: Submitting an invalid hex color code will show an alert with an error message', async () => {
        const editor = hook.editor();
        await pOpenDialog(editor);
        await pSetHex('invalid')(editor);
        TinyUiActions.submitDialog(editor);
        await pAssertExpectedAlert(editor, 'Invalid hex color code: #invalid');
      });

      it('TINY-9287: Keyboard tab navigation works as expected, starting at the canvas', async () => {
        const editor = hook.editor();
        const elem = TinyDom.targetElement(editor);
        const doc = SugarShadowDom.getShadowRoot(elem).getOrThunk(() => SugarDocument.getDocument());
        await pOpenDialog(editor);
        await FocusTools.pTryOnSelector('Should have selected the main view', doc, 'canvas');
        TinyUiActions.keydown(editor, Keys.tab());
        await FocusTools.pTryOnSelector('Should have selected the hue slider', doc, '.tox-hue-slider-spectrum');
        TinyUiActions.keydown(editor, Keys.tab());
        await FocusTools.pTryOnSelector('Should have selected the next input', doc, '.tox-textfield');
        await pCancelDialog(editor);
      });

      it('TINY-9287: Keyboard tab navigation works as expected, starting at the canvas, shift-tab should go backwards', async () => {
        const editor = hook.editor();
        const elem = TinyDom.targetElement(editor);
        const doc = SugarShadowDom.getShadowRoot(elem).getOrThunk(() => SugarDocument.getDocument());
        await pOpenDialog(editor);
        await FocusTools.pTryOnSelector('Should have selected the main view', doc, 'canvas');
        TinyUiActions.keydown(editor, Keys.tab());
        await FocusTools.pTryOnSelector('Should have selected the hue slider', doc, '.tox-hue-slider-spectrum');
        TinyUiActions.keydown(editor, Keys.tab());
        await FocusTools.pTryOnSelector('Should have selected the next input', doc, '.tox-textfield');
        TinyUiActions.keydown(editor, Keys.tab(), { shiftKey: true });
        await FocusTools.pTryOnSelector('Should have selected the hue slider', doc, '.tox-hue-slider-spectrum');
        TinyUiActions.keydown(editor, Keys.tab(), { shiftKey: true });
        await FocusTools.pTryOnSelector('Should have selected the main view', doc, 'canvas');
        await pCancelDialog(editor);
      });

      it('TINY-9287: Clicking changes focus as expected', async () => {
        const editor = hook.editor();
        const element = TinyDom.targetElement(editor);
        const doc = SugarShadowDom.getShadowRoot(element).getOrThunk(() => SugarDocument.getDocument());
        await pOpenDialog(editor);
        await FocusTools.pTryOnSelector('Should have started on the main view', doc, 'canvas');
        let targetElement = UiFinder.findIn(TinyUiActions.getUiRoot(editor), '.tox-hue-slider-spectrum').getOrDie();
        Mouse.mouseDown(targetElement);
        await FocusTools.pTryOnSelector('Should have selected the hue slider', doc, '.tox-hue-slider-spectrum');
        targetElement = UiFinder.findIn(TinyUiActions.getUiRoot(editor), 'canvas').getOrDie();
        Mouse.mouseDown(targetElement);
        await FocusTools.pTryOnSelector('Should have ended on the main view', doc, 'canvas');
        await pCancelDialog(editor);
      });
    });
  });
});
