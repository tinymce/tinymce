import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

describe('browser.tinymce.themes.silver.editor.color.ColorSettingsTest', () => {
  const defaultColors = [
    '#BFEDD2', 'Light Green',
    '#000000', 'Black',
  ];

  const colorSettings = [
    ...defaultColors,
  ];

  const selectors = {
    backcolorSplitButton: (color: string = '') => `[aria-label^="Background color ${color}"] > .tox-tbtn + .tox-split-button__chevron`,
    forecolorSplitButton: (color: string = '') => `[aria-label^="Text color ${color}"] > .tox-tbtn + .tox-split-button__chevron`
  };

  const setColorToDefault = async (editor: Editor, selector: string) => {
    UiFinder.exists(SugarBody.body(), selector);
    TinyUiActions.clickOnToolbar(editor, selector);
    await selectSwatchColor(editor, '#000000');
  };

  const selectSwatchColor = async (editor: Editor, hexCode: string) => {
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, `div[data-mce-color="${hexCode}"]`);
  };

  const clickToolbarAndAssert = async (editor: Editor, selector: string, expectedSelector: string) => {
    UiFinder.exists(SugarBody.body(), selector);
    TinyUiActions.clickOnToolbar(editor, selector);
    await selectSwatchColor(editor, '#BFEDD2');
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  const selectCustomColorAndAssert = async (editor: Editor, selector: string, expectedSelector: string) => {
    TinyUiActions.clickOnToolbar(editor, selector);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, 'button[title="Custom color"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const input = UiFinder.findIn<HTMLInputElement>(dialog, 'label:contains("#") + input').getOrDie();
    UiControls.setValue(input, '123123');
    const evt = new Event('input', {
      bubbles: true,
      cancelable: true
    });
    input.dom.dispatchEvent(evt);
    await Waiter.pTryUntil('Dialog has changed', () => input.dom.value === '123123');
    TinyUiActions.clickOnUi(editor, 'button[title="Save"]');
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  context('untranslated', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor',
      base_url: '/project/tinymce/js/tinymce',
      color_map: colorSettings
    }, []);

    beforeEach(async () => {
      LocalStorage.clear();
      const editor = hook.editor();
      await setColorToDefault(editor, selectors.forecolorSplitButton());
      await setColorToDefault(editor, selectors.backcolorSplitButton());
    });

    it('TINY-9697: Forecolor - default color appended to aria-label', () => {
      hook.editor();
      UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton('Black'));
    });

    it('TINY-9697: Backcolor - default color appended to aria-label', () => {
      hook.editor();
      UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton('Black'));
    });

    it('TINY-9697: Forecolor - aria-label changes when color is selected  ', async () => {
      const editor = hook.editor();
      await clickToolbarAndAssert(editor, selectors.forecolorSplitButton('Black'), selectors.forecolorSplitButton('Light Green'));
    });

    it('TINY-9697: Backcolor - aria-label changes when color is selected', async () => {
      const editor = hook.editor();
      await clickToolbarAndAssert(editor, selectors.backcolorSplitButton('Black'), selectors.backcolorSplitButton('Light Green'));
    });

    it('TINY-9697: Forecolor - aria-label changes when custom color is selected', async () => {
      const editor = hook.editor();
      await selectCustomColorAndAssert(editor, selectors.forecolorSplitButton('Black'), selectors.forecolorSplitButton('#123123'));
    });

    it('TINY-9697: Backcolor - aria-label changes when custom color is selected', async () => {
      const editor = hook.editor();
      await selectCustomColorAndAssert(editor, selectors.backcolorSplitButton('Black'), selectors.backcolorSplitButton('#123123'));
    });
  });

  context('translations', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      toolbar: 'forecolor backcolor',
      base_url: '/project/tinymce/js/tinymce',
      color_map: colorSettings,
      setup: (_: Editor) => {
        I18n.add('en', { 'Black': 'Schwarz', 'Light Green': 'Hellgrun' });
      }
    }, []);

    beforeEach(async () => {
      LocalStorage.clear();
      const editor = hook.editor();
      await setColorToDefault(editor, selectors.forecolorSplitButton());
      await setColorToDefault(editor, selectors.backcolorSplitButton());
    });

    it('TINY-9697: Forecolor - default color appended to aria-label', () => {
      hook.editor();
      UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton('Schwarz'));
    });

    it('TINY-9697: Backcolor - default color appended to aria-label', () => {
      hook.editor();
      UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton('Schwarz'));
    });

    it('TINY-9697: Forecolor - aria-label changes when color is selected', async () => {
      const editor = hook.editor();
      await clickToolbarAndAssert(editor, selectors.forecolorSplitButton('Schwarz'), selectors.forecolorSplitButton('Hellgrun'));
    });

    it('TINY-9697: Backcolor - aria-label changes when color is selected', async () => {
      const editor = hook.editor();
      await clickToolbarAndAssert(editor, selectors.backcolorSplitButton('Schwarz'), selectors.backcolorSplitButton('Hellgrun'));
    });

    it('TINY-9697: Forecolor - aria-label changes when custom color is selected', async () => {
      const editor = hook.editor();
      await selectCustomColorAndAssert(editor, selectors.forecolorSplitButton('Schwarz'), selectors.forecolorSplitButton('#123123'));
    });

    it('TINY-9697: Backcolor - aria-label changes when custom color is selected', async () => {
      const editor = hook.editor();
      await selectCustomColorAndAssert(editor, selectors.backcolorSplitButton('Schwarz'), selectors.backcolorSplitButton('#123123'));
    });
  });
});
