import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderTextarea } from 'tinymce/themes/silver/ui/dialog/TextField';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestProviders from '../../../module/TestProviders';
import { DisablingSteps } from '../../../module/DisablingSteps';

UnitTest.asynctest('Textarea component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderTextarea({
          name: 'textarea',
          label: Option.some('LabelA'),
          placeholder: Option.none(),
          maximized: false,
          disabled: false
        }, TestProviders)
      );
    },
    (doc, body, gui, component, store) => {
      // TODO: Fix dupe with Input test. Test Ctrl+Enter.
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
                s.element('textarea', {
                  classes: [ arr.has('tox-textarea') ],
                  attrs: {
                    'data-alloy-tabstop': str.is('true')
                  }
                })
              ]
            });
          }),
          component.element()
        ),

        RepresentingSteps.sSetValue('basic', component, 'New-Value'),
        RepresentingSteps.sAssertComposedValue('basic', 'New-Value', component),

        // Disabling state
        DisablingSteps.sAssertDisabled('Initial disabled state', false, component),
        DisablingSteps.sSetDisabled('set disabled', component, true),
        DisablingSteps.sAssertDisabled('enabled > disabled', true, component)
      ];
    },
    success,
    failure
  );
});
