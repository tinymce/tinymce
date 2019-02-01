import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';

import { renderTextarea } from '../../../../../main/ts/ui/dialog/TextField';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';

UnitTest.asynctest('Textarea component Test', (success, failure) => {

  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderTextarea({
          name: 'textarea',
          label: Option.some('LabelA'),
          placeholder: Option.none(),
          validation: Option.none()
        }, providers)
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
        RepresentingSteps.sAssertComposedValue('basic', 'New-Value', component)
      ];
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});