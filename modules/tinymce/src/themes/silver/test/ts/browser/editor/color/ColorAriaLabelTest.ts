import { Keys, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun, Strings } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

interface TestScenario {
  label: string;
  buttonColor: string;
  expectedColor: string;
  setup: () => void;
}

describe('browser.tinymce.themes.silver.editor.color.ColorAriaLabelTest', () => {
  const colorSettings = [
    '#BFEDD2', 'Light Green',
    '#000000', 'Black',
  ];

  const selectors = {
    backcolorSplitButton: Fun.constant(`button[data-mce-name="backcolor-chevron"][aria-label="Background color menu"]`),
    forecolorSplitButton: Fun.constant(`button[data-mce-name="forecolor-chevron"][aria-label="Text color menu"]`),
    backcolorMainButton: (color: string = '') => Strings.isEmpty(color) ?
      `button[data-mce-name="backcolor"][aria-label^="Background color"]` :
      `button[data-mce-name="backcolor"][aria-label^="Background color ${color}"]`,
    forecolorMainButton: (color: string = '') => Strings.isEmpty(color) ?
      `button[data-mce-name="forecolor"][aria-label^="Text color"]` :
      `button[data-mce-name="forecolor"][aria-label^="Text color ${color}"]`,
    backcolorMenuItem: (color: string = '') => Strings.isEmpty(color) ?
      `[role="menu"] div[aria-label^="Background color"]` :
      `[role="menu"] div[aria-label^="Background color ${color}"]`,
    forecolorMenuItem: (color: string = '') => Strings.isEmpty(color) ?
      `[role="menu"] div[aria-label^="Text color"]` :
      `[role="menu"] div[aria-label^="Text color ${color}"]`,
    forecolorMenu: 'button:contains("forecolor")',
    backcolorMenu: 'button:contains("backcolor")',
    swatchItemColor: (color: string = '') => `[role="menuitemradio"][data-mce-name="${color}"]`
  };

  const pResetColorToDefault = async (editor: Editor, selector: string) => {
    UiFinder.exists(SugarBody.body(), selector);
    TinyUiActions.clickOnToolbar(editor, selector);
    await pSelectSwatchColor(editor, '#000000');
  };

  const pSelectSwatchColor = async (editor: Editor, hexCode: string) => {
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, `div[data-mce-color="${hexCode}"]`);
  };

  const pOpenMenuAndSwatch = async (editor: Editor, menuSelector: string, menuItemSelector: string) => {
    TinyUiActions.clickOnMenu(editor, menuSelector);
    await TinyUiActions.pWaitForUi(editor, menuItemSelector);
    TinyUiActions.clickOnUi(editor, menuItemSelector);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches-menu');
  };

  const pOpenMenuAndSelectColor = async (editor: Editor, selectColor: string, menuSelector: string, expectedSelector: string) => {
    await pSelectSwatchColor(editor, selectColor);
    TinyUiActions.clickOnMenu(editor, menuSelector);
    await TinyUiActions.pWaitForUi(editor, expectedSelector);
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  const pOpenMenuAndRemoveColor = async (editor: Editor, menuSelector: string, expectedSelector: string) => {
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
    TinyUiActions.clickOnMenu(editor, menuSelector);
    await TinyUiActions.pWaitForUi(editor, expectedSelector);
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  const pSelectCustomAndAssertMenu = async (editor: Editor, menuSelector: string, menuItemSelector: string, expectedSelector: string) => {
    await pOpenMenuAndSwatch(editor, menuSelector, menuItemSelector);

    TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
    const dialog = await TinyUiActions.pWaitForDialog(editor);
    const input = UiFinder.findTargetByLabel<HTMLInputElement>(dialog, '#').getOrDie();
    UiControls.setValue(input, '123123');
    const evt = new Event('input', {
      bubbles: true,
      cancelable: true
    });
    input.dom.dispatchEvent(evt);
    await Waiter.pTryUntil('Dialog has changed', () => input.dom.value === '123123');
    TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
    TinyUiActions.clickOnMenu(editor, menuSelector);
    await TinyUiActions.pWaitForUi(editor, expectedSelector);
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  Arr.each([
    { label: 'no translations - toolbar', buttonColor: 'Black', expectedColor: 'Light Green', setup: () => I18n.setCode('en') },
    { label: 'translations - toolbar', buttonColor: 'Schwarz', expectedColor: 'Hellgrun',
      setup: () => {
        I18n.add('test', { 'Black': 'Schwarz', 'Light Green': 'Hellgrun' });
        I18n.setCode('test');
      }
    },
  ], (scenario: TestScenario) => {
    context(scenario.label, () => {
      const hook = TinyHooks.bddSetupLight<Editor>({
        toolbar: 'forecolor backcolor',
        base_url: '/project/tinymce/js/tinymce',
        color_map: colorSettings,
        color_default_foreground: '#000000',
        color_default_background: '#000000'
      }, []);

      before(() => {
        scenario.setup();
      });

      beforeEach(async () => {
        LocalStorage.clear();
        const editor = hook.editor();
        await pResetColorToDefault(editor, selectors.forecolorSplitButton());
        await pResetColorToDefault(editor, selectors.backcolorSplitButton());
      });

      it('TINY-9697: Forecolor chevron - aria-label is static (no color state)', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton());
      });

      it('TINY-9697: Backcolor chevron - aria-label is static (no color state)', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton());
      });

      it('TINY-9697: Forecolor chevron - aria-label remains static when color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton());
      });

      it('TINY-9697: Backcolor chevron - aria-label remains static when color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton());
      });

      it('TINY-9697: Forecolor chevron - aria-label remains static when custom color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
        const dialog = await TinyUiActions.pWaitForDialog(editor);
        const input = UiFinder.findTargetByLabel<HTMLInputElement>(dialog, '#').getOrDie();
        UiControls.setValue(input, '123123');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
        UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton()); // Still static
      });

      it('TINY-9697: Backcolor chevron - aria-label remains static when custom color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
        const dialog = await TinyUiActions.pWaitForDialog(editor);
        const input = UiFinder.findTargetByLabel<HTMLInputElement>(dialog, '#').getOrDie();
        UiControls.setValue(input, '123123');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
        UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton()); // Still static
      });

      it('TINY-9697: Forecolor chevron - aria-label remains static when color is removed', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
        UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton()); // Still static
      });

      it('TINY-9697: Backcolor chevron - aria-label remains static when color is removed', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
        UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton()); // Still static
      });

      // Tests for main button icon section
      it('TINY-9697: Forecolor main button - default color appended to aria-label', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.forecolorMainButton(scenario.buttonColor));
      });

      it('TINY-9697: Backcolor main button - default color appended to aria-label', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.backcolorMainButton(scenario.buttonColor));
      });

      it('TINY-9697: Forecolor main button - aria-label changes when color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        UiFinder.exists(SugarBody.body(), selectors.forecolorMainButton(scenario.expectedColor));
      });

      it('TINY-9697: Backcolor main button - aria-label changes when color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        UiFinder.exists(SugarBody.body(), selectors.backcolorMainButton(scenario.expectedColor));
      });

      it('TINY-9697: Forecolor main button - aria-label changes when custom color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
        const dialog = await TinyUiActions.pWaitForDialog(editor);
        const input = UiFinder.findTargetByLabel<HTMLInputElement>(dialog, '#').getOrDie();
        UiControls.setValue(input, '123123');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
        UiFinder.exists(SugarBody.body(), selectors.forecolorMainButton('#123123'));
      });

      it('TINY-9697: Backcolor main button - aria-label changes when custom color is selected', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
        const dialog = await TinyUiActions.pWaitForDialog(editor);
        const input = UiFinder.findTargetByLabel<HTMLInputElement>(dialog, '#').getOrDie();
        UiControls.setValue(input, '123123');
        TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
        UiFinder.exists(SugarBody.body(), selectors.backcolorMainButton('#123123'));
      });

      it('TINY-9697: Forecolor main button - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        TinyUiActions.clickOnToolbar(editor, selectors.forecolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
        UiFinder.exists(SugarBody.body(), selectors.forecolorMainButton());
      });

      it('TINY-9697: Backcolor main button - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await pSelectSwatchColor(editor, '#BFEDD2');
        TinyUiActions.clickOnToolbar(editor, selectors.backcolorSplitButton());
        await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
        TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
        UiFinder.exists(SugarBody.body(), selectors.backcolorMainButton());
      });
    });
  });

  Arr.each([
    { label: 'no translations - menu', buttonColor: 'Black', expectedColor: 'Light Green', setup: () => I18n.setCode('en') },
    { label: 'translations - menu', buttonColor: 'Schwarz', expectedColor: 'Hellgrun',
      setup: () => {
        I18n.add('test', { 'Black': 'Schwarz', 'Light Green': 'Hellgrun' });
        I18n.setCode('test');
      }
    },
  ], (scenario: TestScenario) => {
    context(scenario.label, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        menu: {
          backcolor: {
            title: 'backcolor',
            items: 'backcolor'
          },
          forecolor: {
            title: 'forecolor',
            items: 'forecolor'
          }
        },
        color_default_foreground: '#000000',
        color_default_background: '#000000',
        toolbar: 'forecolor backcolor',
        menubar: 'backcolor forecolor',
        base_url: '/project/tinymce/js/tinymce',
        color_map: colorSettings
      }, []);

      before(() => {
        scenario.setup();
      });

      beforeEach(async () => {
        LocalStorage.clear();
        const editor = hook.editor();
        await pResetColorToDefault(editor, selectors.forecolorSplitButton());
        await pResetColorToDefault(editor, selectors.backcolorSplitButton());
      });

      afterEach(() => {
        const editor = hook.editor();
        TinyUiActions.keystroke(editor, Keys.escape());
      });

      it('TINY-9697: Forecolor menu item - default color appended to aria-label', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnMenu(editor, selectors.forecolorMenu);
        await TinyUiActions.pWaitForUi(editor, selectors.forecolorMenuItem(scenario.buttonColor));
        UiFinder.exists(SugarBody.body(), selectors.forecolorMenuItem(scenario.buttonColor));
      });

      it('TINY-9697: Backcolor menu item - default color appended to aria-label', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnMenu(editor, selectors.backcolorMenu);
        await TinyUiActions.pWaitForUi(editor, selectors.backcolorMenuItem(scenario.buttonColor));
        UiFinder.exists(SugarBody.body(), selectors.backcolorMenuItem(scenario.buttonColor));
      });

      it('TINY-9697: Forecolor - aria-label changes when color is selected  ', async () => {
        const editor = hook.editor();
        await pOpenMenuAndSwatch(editor, selectors.forecolorMenu, selectors.forecolorMenuItem(scenario.buttonColor));
        await pOpenMenuAndSelectColor(editor, '#BFEDD2', selectors.forecolorMenu, selectors.forecolorMenuItem(scenario.expectedColor));
      });

      it('TINY-9697: Backcolor - aria-label changes when color is selected  ', async () => {
        const editor = hook.editor();
        await pOpenMenuAndSwatch(editor, selectors.backcolorMenu, selectors.backcolorMenuItem(scenario.buttonColor));
        await pOpenMenuAndSelectColor(editor, '#BFEDD2', selectors.backcolorMenu, selectors.backcolorMenuItem(scenario.expectedColor));
      });

      it('TINY-9697: Backcolor - aria-label changes when custom color is selected  ', async () => {
        const editor = hook.editor();
        await pSelectCustomAndAssertMenu(editor, selectors.backcolorMenu, selectors.backcolorMenuItem(scenario.buttonColor), selectors.backcolorMenuItem('#123123'));
      });

      it('TINY-9697: Forecolor - aria-label changes when custom color is selected  ', async () => {
        const editor = hook.editor();
        await pSelectCustomAndAssertMenu(editor, selectors.forecolorMenu, selectors.forecolorMenuItem(scenario.buttonColor), selectors.forecolorMenuItem('#123123'));
      });

      it('TINY-9697: Forecolor - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        await pOpenMenuAndSwatch(editor, selectors.forecolorMenu, selectors.forecolorMenuItem(scenario.buttonColor));
        await pOpenMenuAndRemoveColor(editor, selectors.forecolorMenu, selectors.forecolorMenuItem());
      });

      it('TINY-9697: Backcolor - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        await pOpenMenuAndSwatch(editor, selectors.backcolorMenu, selectors.backcolorMenuItem(scenario.buttonColor));
        await pOpenMenuAndRemoveColor(editor, selectors.backcolorMenu, selectors.backcolorMenuItem());
      });
    });
  });
});
