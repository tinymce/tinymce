import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderSelectBox } from 'tinymce/themes/silver/ui/dialog/SelectBox';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.selectbox.SelectboxCustomIDTest', () => {
  const providers = {
    ...TestProviders,
    icons: (): Record<string, string> => ({
      'chevron-down': '<svg></svg>' // details don't matter, just needs an SVG for the test
    })
  };

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSelectBox({
      name: 'selector',
      size: 1,
      // Note: in order for out custom id to not be overritten the label must not be set
      label: Optional.none(),
      enabled: true,
      items: [
        { value: 'one', text: 'One' },
        { value: 'two', text: 'Two' },
        { value: 'three', text: 'Three' }
      ],
      id: Optional.some('selectbox-custom-id')
    }, providers, Optional.none())
  ));

  it('TINY-10971: Check if custom id is rendered', () => {
    Assertions.assertStructure(
      'Selectbox should have custom id attribute',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-selectfield') ],
            children: [
              s.element('select', {
                value: str.is('one'),
                attrs: {
                  size: str.is('1'),
                  id: str.is('selectbox-custom-id')
                },
                children: [
                  s.element('option', { value: str.is('one'), html: str.is('One') }),
                  s.element('option', { value: str.is('two'), html: str.is('Two') }),
                  s.element('option', { value: str.is('three'), html: str.is('Three') })
                ]
              }),
              s.element('div', {
                classes: [ arr.has('tox-selectfield__icon-js') ],
                children: [
                  s.element('svg', {})
                ]
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });
});