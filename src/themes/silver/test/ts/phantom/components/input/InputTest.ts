import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderInput } from '../../../../../main/ts/ui/dialog/TextField';
import { GuiSetup } from '../../../module/AlloyTestUtils';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('Input component Test', (success, failure) => {
  const sharedBackstage = {
    translate: I18n.translate
  };

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderInput({
          name: 'input',
          label: Option.some('LabelA'),
          validation: Option.none()
        }, sharedBackstage)
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
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
            });
          }),
          component.element()
        ),

        RepresentingSteps.sSetValue('Setting to new value', component, 'New-Value'),
        RepresentingSteps.sAssertComposedValue('After setting value on form field', 'New-Value', component)
      ];
    },
    success,
    failure
  );
});