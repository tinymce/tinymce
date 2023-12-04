import { UiFinder } from '@ephox/agar';
import { afterEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as MenuUtils from '../../../module/MenuUtils';

interface Scenario {
  readonly menuLabel: string;
  readonly initialItem: string;
  readonly finalItem: string;
}

describe('browser.tinymce.themes.silver.editor.bespoke.DropdownAriaLabelTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/src/themes/silver/test/css/content.css',
    toolbar: 'align fontfamily fontsize blocks styles'
  });

  const testDropdownAriaLabel = (
    initialItem: string,
    finalItem: string,
    makeLabel: (item: string) => string,
    pOpenMenu: (buttonSelector: string) => Promise<void>,
    pWaitForMenu: (editor: Editor, itemSelector: string) => Promise<SugarElement<Element>>
  ) => async () => {
    const editor = hook.editor();
    const buttonSelector = `button[title="${makeLabel(initialItem)}"]`;
    const button = UiFinder.findIn(SugarBody.body(), `.tox-toolbar__group ${buttonSelector}`).getOrDie();

    await pOpenMenu(buttonSelector);
    const itemSelector = `div[role="menuitemcheckbox"][title="${finalItem}"]`;
    await pWaitForMenu(editor, itemSelector);
    assert.equal(Attribute.get(button, 'aria-label'), makeLabel(initialItem));
    TinyUiActions.clickOnUi(editor, itemSelector);
    assert.equal(Attribute.get(button, 'aria-label'), makeLabel(finalItem));
  };

  const testStandardDropdownAriaLabel = (scenario: Scenario) =>
    testDropdownAriaLabel(
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.menuLabel} ${item}`,
      Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.menuLabel),
      TinyUiActions.pWaitForUi
    );

  const testAlignDropdownAriaLabel = (scenario: Scenario) =>
    testDropdownAriaLabel(
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.menuLabel} ${item.toLowerCase()}`,
      () => MenuUtils.pOpenAlignMenu(scenario.menuLabel),
      TinyUiActions.pWaitForUi
    );

  const testFormatsDropdownAriaLabel = (scenario: Scenario) =>
    testDropdownAriaLabel(
      scenario.initialItem,
      scenario.finalItem,
      (item) => `${scenario.menuLabel} ${item}`,
      Fun.curry(MenuUtils.pOpenMenuWithSelector, scenario.menuLabel),
      (editor) => {
        const submenuSelector = 'div[title="Blocks"]';
        return TinyUiActions.pWaitForUi(editor, submenuSelector).then(() => TinyUiActions.clickOnUi(editor, submenuSelector));
      }
    );

  afterEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TINY-10147: align menu should not update aria-label if displayed text does not change', testAlignDropdownAriaLabel({
    menuLabel: 'Align',
    initialItem: 'Left',
    finalItem: 'Left'
  }));

  it('TINY-10147: align menu should update aria-label if displayed text changes', testAlignDropdownAriaLabel({
    menuLabel: 'Align',
    initialItem: 'Left',
    finalItem: 'Right'
  }));

  it('TINY-10147: fontfamily menu should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel({
    menuLabel: 'Font',
    initialItem: 'Verdana',
    finalItem: 'Verdana'
  }));

  it('TINY-10147: fontfamily menu should update aria-label if displayed text changes', testStandardDropdownAriaLabel({
    menuLabel: 'Font',
    initialItem: 'Verdana',
    finalItem: 'Arial'
  }));

  it('TINY-10147: fontsize menu should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel({
    menuLabel: 'Font size',
    initialItem: '12pt',
    finalItem: '12pt'
  }));

  it('TINY-10147: fontsize menu should update aria-label if displayed text changes', testStandardDropdownAriaLabel({
    menuLabel: 'Font size',
    initialItem: '12pt',
    finalItem: '8pt'
  }));

  it('TINY-10147: blocks menu should not update aria-label if displayed text does not change', testStandardDropdownAriaLabel({
    menuLabel: 'Block',
    initialItem: 'Paragraph',
    finalItem: 'Paragraph'
  }));

  it('TINY-10147: blocks menu should update aria-label if displayed text changes', testStandardDropdownAriaLabel({
    menuLabel: 'Block',
    initialItem: 'Paragraph',
    finalItem: 'Heading 1'
  }));

  it('TINY-10147: styles menu should not update aria-label if displayed text does not change', testFormatsDropdownAriaLabel({
    menuLabel: 'Format',
    initialItem: 'Paragraph',
    finalItem: 'Paragraph'
  }));

  it('TINY-10147: styles menu should update aria-label if displayed text changes', testFormatsDropdownAriaLabel({
    menuLabel: 'Format',
    initialItem: 'Paragraph',
    finalItem: 'Div'
  }));
});
