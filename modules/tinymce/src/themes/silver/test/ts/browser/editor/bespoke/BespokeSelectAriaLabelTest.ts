import { UiFinder } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';

import * as MenuUtils from '../../../module/MenuUtils';

interface Scenario {
  readonly label: string;
  readonly initialItem: string;
  readonly finalItem: string;
}

describe('browser.tinymce.themes.silver.editor.bespoke.BespokeSelectAriaLabelTest', () => {
  const settings = {
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/src/themes/silver/test/css/content.css',
    toolbar: 'align fontfamily fontsize blocks styles'
  };

  const testDropdownAriaLabel = (
    hook: TinyHooks.Hook<Editor>,
    initialItem: string,
    finalItem: string,
    makeLabel: (item: string) => string,
    pOpenMenu: (buttonSelector: string) => Promise<void>,
    pWaitForMenu: (editor: Editor, itemSelector: string) => Promise<SugarElement<Element>>
  ) => async () => {
    const editor = hook.editor();
    const buttonSelector = `button[title="${makeLabel(initialItem)}"]`;

    await pOpenMenu(buttonSelector);
    const itemSelector = `div[role="menuitemcheckbox"][title="${finalItem}"]`;
    await pWaitForMenu(editor, itemSelector);

    const button = UiFinder.findIn(SugarBody.body(), `.tox-toolbar__group ${buttonSelector}`).getOrDie();
    assert.equal(Attribute.get(button, 'aria-label'), makeLabel(initialItem));
    TinyUiActions.clickOnUi(editor, itemSelector);
    assert.equal(Attribute.get(button, 'aria-label'), makeLabel(finalItem));
  };

  const testStandardDropdownAriaLabel = (hook: TinyHooks.Hook<Editor>, scenario: Scenario) =>
    testDropdownAriaLabel(
      hook,
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.label} ${item}`,
      Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
      TinyUiActions.pWaitForUi
    );

  const testAlignDropdownAriaLabel = (hook: TinyHooks.Hook<Editor>, scenario: Scenario) =>
    testDropdownAriaLabel(
      hook,
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.label} ${item.toLowerCase()}`,
      Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
      TinyUiActions.pWaitForUi
    );

  const testFormatsDropdownAriaLabel = (hook: TinyHooks.Hook<Editor>, scenario: Scenario) =>
    testDropdownAriaLabel(
      hook,
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.label} ${item}`,
      Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.label),
      (editor) => {
        const submenuSelector = 'div[title="Blocks"]';
        return TinyUiActions.pWaitForUi(editor, submenuSelector).then(() => TinyUiActions.clickOnUi(editor, submenuSelector));
      }
    );

  const makeCleanupFn = (hook: TinyHooks.Hook<Editor>) => () => {
    const editor = hook.editor();
    editor.setContent('');
  };

  context('No translation', () => {
    const hook = TinyHooks.bddSetup<Editor>(settings);

    afterEach(makeCleanupFn(hook));

    it('TINY-10147: align dropdown should not update aria-label if displayed text does not change', testAlignDropdownAriaLabel(hook, {
      label: 'Alignment',
      initialItem: 'Left',
      finalItem: 'Left'
    }));

    it('TINY-10147: align dropdown should update aria-label if displayed text changes', testAlignDropdownAriaLabel(hook, {
      label: 'Alignment',
      initialItem: 'Left',
      finalItem: 'Right'
    }));

    it('TINY-10147: fontfamily dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Font',
      initialItem: 'Verdana',
      finalItem: 'Verdana'
    }));

    it('TINY-10147: fontfamily dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Font',
      initialItem: 'Verdana',
      finalItem: 'Arial'
    }));

    it('TINY-10147: fontsize dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Font size',
      initialItem: '12pt',
      finalItem: '12pt'
    }));

    it('TINY-10147: fontsize dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Font size',
      initialItem: '12pt',
      finalItem: '8pt'
    }));

    it('TINY-10147: blocks dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Block',
      initialItem: 'Paragraph',
      finalItem: 'Paragraph'
    }));

    it('TINY-10147: blocks dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Block',
      initialItem: 'Paragraph',
      finalItem: 'Heading 1'
    }));

    it('TINY-10147: styles dropdown should not update aria-label if displayed text does not change', testFormatsDropdownAriaLabel(hook, {
      label: 'Format',
      initialItem: 'Paragraph',
      finalItem: 'Paragraph'
    }));

    it('TINY-10147: styles dropdown should update aria-label if displayed text changes', testFormatsDropdownAriaLabel(hook, {
      label: 'Format',
      initialItem: 'Paragraph',
      finalItem: 'Div'
    }));
  });

  context('With translations', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      ...settings,
      language: 'test',
      setup: () => {
        I18n.add('test', {
          'Alignment {0}': 'Aalignment {0}',
          'left': 'left translated',
          'right': 'right translated',
          'Left': 'Left translated',
          'Right': 'Right translated',

          'Font {0}': 'Ffont {0}',
          'Verdana': 'Verdana translated',
          'Arial': 'Arial translated',

          'Font size {0}': 'Ffont size {0}',
          '12pt': '12pt translated',
          '8pt': '8pt translated',

          'Block {0}': 'Bblock {0}',
          'Format {0}': 'Fformat {0}',
          'Paragraph': 'Paragraph translated',
          'Heading 1': 'Heading 1 translated',
          'Div': 'Div translated'
        });
      }
    });

    afterEach(makeCleanupFn(hook));

    it('TINY-10426: align dropdown should not update aria-label if displayed text does not change', testAlignDropdownAriaLabel(hook, {
      label: 'Aalignment',
      initialItem: 'Left translated',
      finalItem: 'Left translated'
    }));

    it('TINY-10426: align dropdown should update aria-label if displayed text changes', testAlignDropdownAriaLabel(hook, {
      label: 'Aalignment',
      initialItem: 'Left translated',
      finalItem: 'Right translated'
    }));

    it('TINY-10426: fontfamily dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Ffont',
      initialItem: 'Verdana translated',
      finalItem: 'Verdana translated'
    }));

    it('TINY-10426: fontfamily dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Ffont',
      initialItem: 'Verdana translated',
      finalItem: 'Arial translated'
    }));

    it('TINY-10426: fontsize dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Ffont size',
      initialItem: '12pt translated',
      finalItem: '12pt translated'
    }));

    it('TINY-10426: fontsize dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Ffont size',
      initialItem: '12pt translated',
      finalItem: '8pt translated'
    }));

    it('TINY-10426: blocks dropdown should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel(hook, {
      label: 'Bblock',
      initialItem: 'Paragraph translated',
      finalItem: 'Paragraph translated'
    }));

    it('TINY-10426: blocks dropdown should update aria-label if displayed text changes', testStandardDropdownAriaLabel(hook, {
      label: 'Bblock',
      initialItem: 'Paragraph translated',
      finalItem: 'Heading 1 translated'
    }));

    it('TINY-10426: styles dropdown should not update aria-label if displayed text does not change', testFormatsDropdownAriaLabel(hook, {
      label: 'Fformat',
      initialItem: 'Paragraph translated',
      finalItem: 'Paragraph translated'
    }));

    it('TINY-10426: styles dropdown should update aria-label if displayed text changes', testFormatsDropdownAriaLabel(hook, {
      label: 'Fformat',
      initialItem: 'Paragraph translated',
      finalItem: 'Div translated'
    }));
  });
});
