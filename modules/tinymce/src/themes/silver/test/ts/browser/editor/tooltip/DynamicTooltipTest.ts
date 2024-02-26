import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { afterEach, before, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';

import * as MenuUtils from '../../../module/MenuUtils';
import * as TooltipUtils from '../../../module/TooltipUtils';

interface ColorTestScenario {
  label: string;
  buttonColor: string;
  expectedColor: string;
  setup: () => void;
}

interface BespokeButtonsScenario {
  readonly label: string;
  readonly initialItem: string;
  readonly finalItem: string;
  readonly buttonSelector: string;
}

describe('browser.tinymce.themes.silver.editor.TooltipShortcutTest', () => {
  context('Color buttons', () => {
    const colorSettings = [
      '#BFEDD2', 'Light Green',
      '#000000', 'Black',
    ];

    const hook = TinyHooks.bddSetup<Editor>({
      toolbar: 'forecolor backcolor',
      toolbar_mode: 'wrap',
      base_url: '/project/tinymce/js/tinymce',
      color_map: colorSettings,
      color_default_foreground: '#000000',
      color_default_background: '#000000'
    });

    const pResetColorToDefault = async (editor: Editor, selector: string) => {
      TinyUiActions.clickOnToolbar(editor, selector);
      await pSelectSwatchColor(editor, '#000000');
    };

    const pSelectSwatchColor = async (editor: Editor, hexCode: string) => {
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, `div[data-mce-color="${hexCode}"]`);
    };

    const pSelectCustomColor = async (editor: Editor, selector: string) => {
      TinyUiActions.clickOnToolbar(editor, selector);
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Custom color"]');
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      const input = UiFinder.findIn<HTMLInputElement>(dialog, 'label:contains("#") + input').getOrDie();
      UiControls.setValue(input, '123123');
      const evt = new Event('input', {
        bubbles: true,
        cancelable: true
      });
      input.dom.dispatchEvent(evt);
      await Waiter.pTryUntil('Dialog has changed', () => input.dom.value === '123123');
      TinyUiActions.clickOnUi(editor, 'button[data-mce-name="Save"]');
    };

    Arr.each([
      { label: 'no translations', buttonColor: 'Black', expectedColor: 'Light Green', setup: () => I18n.setCode('en') },
      { label: 'translations', buttonColor: 'Schwarz', expectedColor: 'Hellgrun',
        setup: () => {
          I18n.add('test', { 'Black': 'Schwarz', 'Light Green': 'Hellgrun' });
          I18n.setCode('test');
        }
      }], (scenario: ColorTestScenario) => {

      context(scenario.label, () => {
        before(() => scenario.setup());
        beforeEach(async () => {
          LocalStorage.clear();
          const editor = hook.editor();
          await pResetColorToDefault(editor, 'div[data-mce-name="forecolor"]');
          await pResetColorToDefault(editor, 'div[data-mce-name="backcolor"]');
        });

        it(`TINY-10474: Tooltip text is the default color - forecolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="forecolor"]`;
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), `Text color ${scenario.buttonColor}`);
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

        it(`TINY-10474: Tooltip text is the changed color - forecolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="forecolor"]`;
          TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
          await pSelectSwatchColor(editor, '#BFEDD2');
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), `Text color ${scenario.expectedColor}`);
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

        it(`TINY-10474: Tooltip text is the changed custom color - forecolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="forecolor"]`;
          await pSelectCustomColor(editor, toolbarButtonSelector);
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), 'Text color #123123');
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

        it(`TINY-10474: Tooltip text is the default color - backcolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="backcolor"]`;
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), `Background color ${scenario.buttonColor}`);
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

        it(`TINY-10474: Tooltip text is the changed color - backcolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="backcolor"]`;
          TinyUiActions.clickOnToolbar(editor, toolbarButtonSelector);
          await pSelectSwatchColor(editor, '#BFEDD2');
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), `Background color ${scenario.expectedColor}`);
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

        it(`TINY-10474: Tooltip text is the changed custom color - backcolor - ${scenario.label}`, async () => {
          const editor = hook.editor();
          const toolbarButtonSelector = `div[data-mce-name="backcolor"]`;
          await pSelectCustomColor(editor, toolbarButtonSelector);
          await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, toolbarButtonSelector), 'Background color #123123');
          await TooltipUtils.pCloseTooltip(editor, toolbarButtonSelector);
        });

      });
    });
  });

  context('Bespoke buttons', () => {
    const settings = {
      toolbar: 'styles fontsize fontfamily blocks align',
      toolbar_mode: 'wrap',
      base_url: '/project/tinymce/js/tinymce',
      content_css: '/project/tinymce/src/themes/silver/test/css/content.css',
    };

    const makeCleanupFn = (hook: TinyHooks.Hook<Editor>) => () => {
      const editor = hook.editor();
      editor.setContent('');
    };

    const testDropdownCustomTooltip = (
      hook: TinyHooks.Hook<Editor>,
      toolbarButtonSelector: string,
      initialItem: string,
      finalItem: string,
      makeLabel: (item: string) => string,
      pOpenMenu: (buttonSelector: string) => Promise<void>,
      pWaitForMenu: (editor: Editor, itemSelector: string) => Promise<SugarElement<Element>>
    ) => async () => {
      const editor = hook.editor();
      const buttonSelector = `button[data-mce-name="${toolbarButtonSelector.toLowerCase()}"]`;

      await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), `${makeLabel(initialItem)}`);

      await pOpenMenu(buttonSelector);
      const itemSelector = `div[role="menuitemcheckbox"][aria-label="${finalItem}"]`;
      await pWaitForMenu(editor, itemSelector);
      TinyUiActions.clickOnUi(editor, itemSelector);
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), `${makeLabel(finalItem)}`);
      await TooltipUtils.pCloseTooltip(editor, buttonSelector);
    };

    const testStandardDropdownCustomTooltip = (hook: TinyHooks.Hook<Editor>, scenario: BespokeButtonsScenario) =>
      testDropdownCustomTooltip(
        hook,
        scenario.buttonSelector,
        scenario.initialItem,
        scenario.finalItem,
        (item: string) => `${scenario.label} ${item}`,
        Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
        TinyUiActions.pWaitForUi
      );

    const testAlignDropdownCustomTooltip = (hook: TinyHooks.Hook<Editor>, scenario: BespokeButtonsScenario) =>
      testDropdownCustomTooltip(
        hook,
        scenario.buttonSelector,
        scenario.initialItem,
        scenario.finalItem,
        (item) => `${scenario.label} ${item.toLowerCase()}`,
        Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
        TinyUiActions.pWaitForUi
      );

    const testFormatsDropdownCustomTooltip = (hook: TinyHooks.Hook<Editor>, scenario: BespokeButtonsScenario) =>
      testDropdownCustomTooltip(
        hook,
        scenario.buttonSelector,
        scenario.initialItem,
        scenario.finalItem,
        (item) => `${scenario.label} ${item}`,
        Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
        async (editor) => {
          const submenuSelector = 'div[aria-label="Blocks"]';
          return TinyUiActions.pWaitForUi(editor, submenuSelector).then(() => TinyUiActions.clickOnUi(editor, submenuSelector));
        }
      );

    context('No translation', () => {
      const hook = TinyHooks.bddSetup<Editor>(settings);
      afterEach(makeCleanupFn(hook));

      it('TINY-10474: align dropdown should not update custom tooltip if displayed text does not change', testAlignDropdownCustomTooltip(hook, {
        label: 'Alignment',
        initialItem: 'Left',
        finalItem: 'Left',
        buttonSelector: 'align'
      }));

      it('TINY-10474: align dropdown should update custom tooltip if displayed text changes', testAlignDropdownCustomTooltip(hook, {
        label: 'Alignment',
        initialItem: 'Left',
        finalItem: 'Right',
        buttonSelector: 'align'
      }));

      it('TINY-10474: styles dropdown should not update custom tooltip if displayed text does not change', testFormatsDropdownCustomTooltip(hook, {
        label: 'Format',
        initialItem: 'Paragraph',
        finalItem: 'Paragraph',
        buttonSelector: 'styles'
      }));

      it('TINY-10474: styles dropdown should update custom tooltip if displayed text changes', testFormatsDropdownCustomTooltip(hook, {
        label: 'Format',
        initialItem: 'Paragraph',
        finalItem: 'Div',
        buttonSelector: 'styles'
      }));

      it('TINY-10474: fontfamily dropdown should not update custom tooltip if displayed text does not change', testStandardDropdownCustomTooltip(hook, {
        label: 'Font',
        initialItem: 'Verdana',
        finalItem: 'Verdana',
        buttonSelector: 'fontfamily'
      }));

      it('TINY-10474: fontfamily dropdown should update custom tooltip if displayed text changes', testStandardDropdownCustomTooltip(hook, {
        label: 'Font',
        initialItem: 'Verdana',
        finalItem: 'Arial',
        buttonSelector: 'fontfamily'
      }));

      it('TINY-10474: fontsize dropdown should not update custom tooltip if displayed text does not change', testStandardDropdownCustomTooltip(hook, {
        label: 'Font size',
        initialItem: '12pt',
        finalItem: '12pt',
        buttonSelector: 'fontsize',
      }));

      it('TINY-10474: fontsize dropdown should update custom tooltip if displayed text changes', testStandardDropdownCustomTooltip(hook, {
        label: 'Font size',
        initialItem: '12pt',
        finalItem: '8pt',
        buttonSelector: 'fontsize',
      }));

      it('TINY-10474: blocks dropdown should not update custom tooltip if displayed text does not change', testStandardDropdownCustomTooltip(hook, {
        label: 'Block',
        initialItem: 'Paragraph',
        finalItem: 'Paragraph',
        buttonSelector: 'blocks'
      }));

      it('TINY-10474: blocks dropdown should update custom tooltip if displayed text changes', testStandardDropdownCustomTooltip(hook, {
        label: 'Block',
        initialItem: 'Paragraph',
        finalItem: 'Heading 1',
        buttonSelector: 'blocks'
      }));
    });

    context('No translation, with custom style formats', () => {
      const hook = TinyHooks.bddSetup<Editor>({
        ...settings,
        style_formats: [
          {
            title: 'Button',
            selector: 'a',
            classes: 'button'
          },
          {
            title: 'Heading 1',
            format: 'h1'
          },
          {
            title: 'Italic',
            format: 'italic'
          }
        ]
      });
      afterEach(makeCleanupFn(hook));

      it('TINY-10603: styles dropdown should default to Formats when Paragraph is not configured', async () => {
        const editor = hook.editor();
        const buttonSelector = `button[data-mce-name="styles"]`;
        await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), `Formats`);
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });

      it('TINY-10603: styles dropdown should update custom tooltip if display text changes', async () => {
        const editor = hook.editor();
        const buttonSelector = `button[data-mce-name="styles"]`;

        await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), `Formats`);

        await MenuUtils.pOpenMenuWithSelector('Formats', buttonSelector);
        const itemSelector = `div[role="menuitemcheckbox"][aria-label="Heading 1"]`;
        TinyUiActions.clickOnUi(editor, itemSelector);
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
        await TooltipUtils.pAssertTooltip(editor, () => TooltipUtils.pTriggerTooltipWithMouse(editor, buttonSelector), `Format Heading 1`);
        await TooltipUtils.pCloseTooltip(editor, buttonSelector);
      });
    });
  });
});
