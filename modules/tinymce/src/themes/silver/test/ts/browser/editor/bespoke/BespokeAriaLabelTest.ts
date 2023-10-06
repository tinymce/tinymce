import { UiFinder } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as MenuUtils from '../../../module/MenuUtils';

describe('browser.tinymce.themes.silver.editor.bespoke.BespokeAriaLabelTest', () => {
  const baseSettings = {
    base_url: '/project/tinymce/js/tinymce',
    content_css: '/project/tinymce/src/themes/silver/test/css/content.css'
  };

  context('Dropdown', () => {
    interface DropdownScenario {
      readonly menuLabel: string;
      readonly initialItem: string;
      readonly finalItem: string;
    }

    const hook = TinyHooks.bddSetup<Editor>({
      ...baseSettings,
      toolbar: 'align fontfamily fontsize blocks styles'
    });

    const testDropdownAriaLabel = (scenario: DropdownScenario) => async () => {
      const isAlign = scenario.menuLabel === 'Align';
      const makeLabel = (item: string) => `${scenario.menuLabel} ${isAlign ? item.toLowerCase() : item}`;

      const editor = hook.editor();
      const buttonSelector = `button[title="${makeLabel(scenario.initialItem)}"]`;
      const button = UiFinder.findIn(SugarBody.body(), `.tox-toolbar__group ${buttonSelector}`).getOrDie();
      if (isAlign) {
        await MenuUtils.pOpenAlignMenu(scenario.menuLabel);
      } else {
        await MenuUtils.pOpenMenuWithSelector(scenario.menuLabel, buttonSelector);
      }
      const itemSelector = `div[role="menuitemcheckbox"][title="${scenario.finalItem}"]`;
      if (scenario.menuLabel === 'Formats') {
        const submenuSelector = 'div[title="Blocks"]';
        await TinyUiActions.pWaitForUi(editor, submenuSelector);
        TinyUiActions.clickOnUi(editor, submenuSelector);
      } else {
        await TinyUiActions.pWaitForUi(editor, itemSelector);
      }
      assert.equal(Attribute.get(button, 'aria-label'), makeLabel(scenario.initialItem));
      TinyUiActions.clickOnUi(editor, itemSelector);
      assert.equal(Attribute.get(button, 'aria-label'), makeLabel(scenario.finalItem));
    };

    afterEach(() => {
      const editor = hook.editor();
      editor.setContent('');
    });

    it('TINY-10147: Align menu should not update aria-label if displayed text does not change', testDropdownAriaLabel({
      menuLabel: 'Align',
      initialItem: 'Left',
      finalItem: 'Left'
    }));

    it('TINY-10147: Align menu should update aria-label if displayed text changes', testDropdownAriaLabel({
      menuLabel: 'Align',
      initialItem: 'Left',
      finalItem: 'Right'
    }));

    it('TINY-10147: Font family menu should not update aria-label if displayed text does not change', testDropdownAriaLabel({
      menuLabel: 'Fonts',
      initialItem: 'Verdana',
      finalItem: 'Verdana'
    }));

    it('TINY-10147: Font family menu should update aria-label if displayed text changes', testDropdownAriaLabel({
      menuLabel: 'Fonts',
      initialItem: 'Verdana',
      finalItem: 'Arial'
    }));

    it('TINY-10147: Font size menu should not update aria-label if displayed text does not change', testDropdownAriaLabel({
      menuLabel: 'Font sizes',
      initialItem: '12pt',
      finalItem: '12pt'
    }));

    it('TINY-10147: Font size menu should update aria-label if displayed text changes', testDropdownAriaLabel({
      menuLabel: 'Font sizes',
      initialItem: '12pt',
      finalItem: '8pt'
    }));

    it('TINY-10147: Blocks menu should not update aria-label if displayed text does not change', testDropdownAriaLabel({
      menuLabel: 'Blocks',
      initialItem: 'Paragraph',
      finalItem: 'Paragraph'
    }));

    it('TINY-10147: Blocks menu should update aria-label if displayed text changes', testDropdownAriaLabel({
      menuLabel: 'Blocks',
      initialItem: 'Paragraph',
      finalItem: 'Heading 1'
    }));

    it('TINY-10147: Styles menu should not update aria-label if displayed text does not change', testDropdownAriaLabel({
      menuLabel: 'Formats',
      initialItem: 'Paragraph',
      finalItem: 'Paragraph'
    }));

    it('TINY-10147: Styles menu should update aria-label if displayed text changes', testDropdownAriaLabel({
      menuLabel: 'Formats',
      initialItem: 'Paragraph',
      finalItem: 'Div'
    }));
  });
});
