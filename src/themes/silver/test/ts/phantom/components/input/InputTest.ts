import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';

import { renderInput } from '../../../../../main/ts/ui/dialog/TextField';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';

UnitTest.asynctest('Input component Test', (success, failure) => {

  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderInput({
          name: 'input',
          label: Option.some('LabelA'),
          placeholder: Option.none(),
          validation: Option.none()
        }, providers)
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
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});