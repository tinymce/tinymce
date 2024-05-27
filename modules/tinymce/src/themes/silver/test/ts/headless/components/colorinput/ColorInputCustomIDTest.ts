import { ApproxStructure, Assertions } from '@ephox/agar';
import { Container, GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';

import { renderColorInput } from 'tinymce/themes/silver/ui/dialog/ColorInput';

import * as TestExtras from '../../../module/TestExtras';

describe('headless.tinymce.themes.silver.components.colorinput.ColorInputCustomIDTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ 'colorinput-container' ]
      },
      components: [
        renderColorInput({
          name: 'alpha',
          storageKey: 'test',
          // Note: in order for out custom id to not be overritten the label must not be set
          label: Optional.none(),
          id: Optional.some('test-color-input-id')
        }, extrasHook.access().extras.backstages.popup.shared, {
          colorPicker: (_callback, _value) => {},
          hasCustomColors: Fun.always,
          getColors: () => [
            { type: 'choiceitem', text: 'Turquoise', value: '#18BC9B' },
            { type: 'choiceitem', text: 'Green', value: '#2FCC71' },
            { type: 'choiceitem', text: 'Blue', value: '#3598DB' },
            { type: 'choiceitem', text: 'Purple', value: '#9B59B6' },
            { type: 'choiceitem', text: 'Navy Blue', value: '#34495E' }
          ],
          getColorCols: Fun.constant(3)
        }, Optional.none())
      ]
    })
  ));

  it('TINY-10971: Check if custom id is rendered', () => {
    Assertions.assertStructure(
      'Input should have custom id attribute',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        children: [
          s.element('div', {
            children: [
              s.element('div', {
                children: [
                  s.element('input', {
                    attrs: {
                      id: str.is('test-color-input-id')
                    }
                  }),
                  s.element('span', {})
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
