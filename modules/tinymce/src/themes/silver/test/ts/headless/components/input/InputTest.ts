import { ApproxStructure, Assertions } from '@ephox/agar';
import { Disabling, GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { renderInput } from 'tinymce/themes/silver/ui/dialog/TextField';

import * as RepresentingUtils from '../../../module/RepresentingUtils';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.input.InputTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderInput({
      name: 'input',
      // Note: The label is intentionally HTML like to ensure the label is rendered as plain text
      label: Optional.some('Solid<Liquid<Gas'),
      inputMode: Optional.none(),
      placeholder: Optional.none(),
      maximized: false,
      enabled: true,
    }, TestProviders, Optional.none())
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ],
            children: [
              s.text(str.is('Solid<Liquid<Gas'))
            ]
          }),
          s.element('input', {
            classes: [ arr.has('tox-textfield') ],
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Representing state', () => {
    const component = hook.component();
    Representing.setValue(component, 'New-Value');
    RepresentingUtils.assertComposedValue(component, 'New-Value');
  });

  it('Disabling state', () => {
    const component = hook.component();
    assert.isFalse(Disabling.isDisabled(component), 'Initial disabled state');
    Disabling.set(component, true);
    assert.isTrue(Disabling.isDisabled(component), 'enabled > disabled');
  });
});
