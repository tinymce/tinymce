import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderInput } from 'tinymce/themes/silver/ui/dialog/TextField';
import { DisablingSteps } from '../../../module/DisablingSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Input component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderInput({
        name: 'input',
        label: Optional.some('LabelA'),
        inputMode: Optional.none(),
        placeholder: Optional.none(),
        maximized: false,
        disabled: false
      }, TestProviders)
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-form__group') ],
          children: [
            s.element('label', {
              classes: [ arr.has('tox-label') ],
              html: str.is('LabelA')
            }),
            s.element('input', {
              classes: [ arr.has('tox-textfield') ],
              attrs: {
                'data-alloy-tabstop': str.is('true')
              }
            })
          ]
        })),
        component.element
      ),

      RepresentingSteps.sSetValue('Setting to new value', component, 'New-Value'),
      RepresentingSteps.sAssertComposedValue('After setting value on form field', 'New-Value', component),

      // Disabling state
      DisablingSteps.sAssertDisabled('Initial disabled state', false, component),
      DisablingSteps.sSetDisabled('set disabled', component, true),
      DisablingSteps.sAssertDisabled('enabled > disabled', true, component)
    ],
    success,
    failure
  );
});
