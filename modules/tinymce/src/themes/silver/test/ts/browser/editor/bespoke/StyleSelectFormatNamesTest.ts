import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

import * as MenuUtils from '../../../module/MenuUtils';

interface StyleSelectMenuItem {
  readonly element: string;
  readonly title: string;
}

describe('browser.tinymce.themes.silver.editor.bespoke.StyleSelectFormatNamesTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    toolbar: 'styles',
    base_url: '/project/tinymce/js/tinymce',
    style_formats: [
      {
        name: 'my-inline',
        title: 'Named inline format',
        inline: 'span',
        classes: [ 'my-inline' ]
      },
      {
        name: 'my-block',
        title: 'Named block format',
        block: 'h1',
        classes: [ 'my-block' ]
      },
      {
        name: 'my-selector',
        title: 'Named selector format',
        selector: 'p',
        classes: [ 'my-selector' ]
      },
      {
        title: 'Unnamed inline format',
        inline: 'span',
        classes: [ 'my-inline' ]
      },
      {
        title: 'Unnamed block format',
        block: 'h1',
        classes: [ 'my-block' ]
      },
      {
        title: 'Unnamed selector format',
        selector: 'p',
        classes: [ 'my-selector' ]
      }
    ]
  }, []);

  const assertStyleSelectMenuItems = (label: string, expectedItems: StyleSelectMenuItem[]) => {
    const group = UiFinder.findIn(SugarBody.body(), '.tox-selected-menu .tox-collection__group').getOrDie();
    Assertions.assertStructure('Checking structure', ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-collection__group') ],
      children: Arr.map(expectedItems, (expected) => s.element('div', {
        attrs: {
          role: str.is('menuitemcheckbox'),
          title: str.is(expected.title)
        },
        children: [
          s.element('div', {
            classes: [ arr.has('tox-collection__item-label') ],
            children: [
              s.element(expected.element, {
                children: [
                  s.text(str.is(expected.title))
                ]
              })
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-collection__item-checkmark') ],
            children: [
              s.anything()
            ]
          })
        ]
      }))
    })), group);
  };

  const assertFormatExists = (editor: Editor, formatName: string) => {
    assert.isTrue(editor.formatter.has(formatName), `Expected format: ${formatName} to exist`);
  };

  it('Configured style_formats are included in the styles toolbar button', async () => {
    await MenuUtils.pOpenMenu('Format', 'Paragraph:last');
    assertStyleSelectMenuItems('Checking style select items', [
      { title: 'Named inline format', element: 'span' },
      { title: 'Named block format', element: 'h1' },
      { title: 'Named selector format', element: 'div' },
      { title: 'Unnamed inline format', element: 'span' },
      { title: 'Unnamed block format', element: 'h1' },
      { title: 'Unnamed selector format', element: 'div' }
    ]);
  });

  it('Style formats name is derived from the title', () => {
    const editor = hook.editor();
    assertFormatExists(editor, 'custom-my-inline');
    assertFormatExists(editor, 'custom-my-block');
    assertFormatExists(editor, 'custom-my-selector');
    assertFormatExists(editor, 'custom-unnamed inline format');
    assertFormatExists(editor, 'custom-unnamed block format');
    assertFormatExists(editor, 'custom-unnamed selector format');
  });
});
