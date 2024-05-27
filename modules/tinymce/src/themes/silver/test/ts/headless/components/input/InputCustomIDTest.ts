import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderInput } from 'tinymce/themes/silver/ui/dialog/TextField';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.input.InputCustomIDTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderInput({
      name: 'input',
      // Note: in order for out custom id to not be overritten the label must not be set
      label: Optional.none(),
      inputMode: Optional.none(),
      placeholder: Optional.none(),
      maximized: false,
      enabled: true,
      id: Optional.some('input-id-test')
    }, TestProviders, Optional.none())
  ));

  it('TINY-10971: Check if custom id is rendered', () => {
    Assertions.assertStructure(
      'Input should have custom id attribute',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('input', {
            classes: [ arr.has('tox-textfield') ],
            attrs: {
              'data-alloy-tabstop': str.is('true'),
              'id': str.is('input-id-test')
            }
          })
        ]
      })),
      hook.component().element
    );
  });
});
