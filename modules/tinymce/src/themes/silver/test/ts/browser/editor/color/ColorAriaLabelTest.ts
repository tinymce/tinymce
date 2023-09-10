import { Keys, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';
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
    backcolorSplitButton: (color: string = '') => Strings.isEmpty(color) ? `[aria-label^="Background color"] > .tox-tbtn + .tox-split-button__chevron` : `[aria-label^="Background color ${color}"] > .tox-tbtn + .tox-split-button__chevron`,
    forecolorSplitButton: (color: string = '') => Strings.isEmpty(color) ? `[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron` : `[aria-label^="Text color ${color}"] > .tox-tbtn + .tox-split-button__chevron`,
    backcolorMenuItem: (color: string = '') => Strings.isEmpty(color) ? `[role="menu"] div[aria-label^="Background color"]` : `[role="menu"] div[aria-label^="Background color ${color}"]`,
    forecolorMenuItem: (color: string = '') => Strings.isEmpty(color) ? `[role="menu"] div[aria-label^="Text color"]` : `[role="menu"] div[aria-label^="Text color ${color}"]`,
    forecolorMenu: 'button:contains("forecolor")',
    backcolorMenu: 'button:contains("backcolor")',
    swatchItemColor: (color: string = '') => `[role="menuitemradio"][title="${color}"]`
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

  const pSelectToolbarColorAndAssert = async (editor: Editor, toolbarButtonSelector: string, selectColor: string, expectedSelector: string) => {
    UiFinder.exists(SugarBody.body(), toolbarButtonSelector);
    TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
    await pSelectSwatchColor(editor, selectColor);
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  const pRemoveColorAndAssert = async (editor: Editor, tooblarButtonSelector: string, expectedSelector: string) => {
    UiFinder.exists(SugarBody.body(), tooblarButtonSelector);
    TinyUiActions.clickOnToolbar(editor, tooblarButtonSelector);
    await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
    TinyUiActions.clickOnUi(editor, selectors.swatchItemColor('Remove color'));
    UiFinder.exists(SugarBody.body(), expectedSelector);
  };

  const pSelectCustomAndAssertToolbar = async (editor: Editor, selector: string, expectedSelector: string) => {
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

      it('TINY-9697: Forecolor - default color appended to aria-label', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.forecolorSplitButton(scenario.buttonColor));
      });

      it('TINY-9697: Backcolor - default color appended to aria-label', () => {
        hook.editor();
        UiFinder.exists(SugarBody.body(), selectors.backcolorSplitButton(scenario.buttonColor));
      });

      it('TINY-9697: Forecolor - aria-label changes when color is selected  ', async () => {
        const editor = hook.editor();
        await pSelectToolbarColorAndAssert(editor, selectors.forecolorSplitButton(scenario.buttonColor), '#BFEDD2', selectors.forecolorSplitButton(scenario.expectedColor));
      });

      it('TINY-9697: Backcolor - aria-label changes when color is selected', async () => {
        const editor = hook.editor();
        await pSelectToolbarColorAndAssert(editor, selectors.backcolorSplitButton(scenario.buttonColor), '#BFEDD2', selectors.backcolorSplitButton(scenario.expectedColor));
      });

      it('TINY-9697: Forecolor - aria-label changes when custom color is selected', async () => {
        const editor = hook.editor();
        await pSelectCustomAndAssertToolbar(editor, selectors.forecolorSplitButton(scenario.buttonColor), selectors.forecolorSplitButton('#123123'));
      });

      it('TINY-9697: Backcolor - aria-label changes when custom color is selected', async () => {
        const editor = hook.editor();
        await pSelectCustomAndAssertToolbar(editor, selectors.backcolorSplitButton(scenario.buttonColor), selectors.backcolorSplitButton('#123123'));
      });

      it('TINY-9697: Forecolor - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        await pSelectToolbarColorAndAssert(editor, selectors.forecolorSplitButton(scenario.buttonColor), '#BFEDD2', selectors.forecolorSplitButton(scenario.expectedColor));
        await pRemoveColorAndAssert(editor, selectors.forecolorSplitButton(scenario.expectedColor), selectors.forecolorSplitButton());
      });

      it('TINY-9697: Backcolor - Remove color should remove color in aria-label', async () => {
        const editor = hook.editor();
        await pSelectToolbarColorAndAssert(editor, selectors.backcolorSplitButton(scenario.buttonColor), '#BFEDD2', selectors.backcolorSplitButton(scenario.expectedColor));
        await pRemoveColorAndAssert(editor, selectors.backcolorSplitButton(scenario.expectedColor), selectors.backcolorSplitButton());
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

      it('TINY-9697: Forecolor - default color appended to aria-label', async () => {
        const editor = hook.editor();
        TinyUiActions.clickOnMenu(editor, selectors.forecolorMenu);
        await TinyUiActions.pWaitForUi(editor, selectors.forecolorMenuItem(scenario.buttonColor));
        UiFinder.exists(SugarBody.body(), selectors.forecolorMenuItem(scenario.buttonColor));
      });

      it('TINY-9697: Backcolor - default color appended to aria-label', async () => {
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
