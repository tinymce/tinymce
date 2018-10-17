import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderInput } from '../../../../../main/ts/ui/dialog/TextField';
import { GuiSetup } from '../../../module/AlloyTestUtils';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import { renderUiLabel } from 'tinymce/themes/silver/ui/general/UiLabel';
import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import { setupDemo } from 'src/themes/silver/demo/ts/components/DemoHelpers';

UnitTest.asynctest('Ui Label component Test', (success, failure) => {
  const helpers = setupDemo();
  const sharedBackstage = helpers.extras.backstage.shared;

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderUiLabel({
          html: 'Group of Options',
          name: 'helloName2',
          items: [
            renderCheckbox({
              label: 'check box item 1',
              name: 'one'
            }, sharedBackstage.providers),
            renderInput({
              label: Option.some('exampleInput'),
              name: 'exampleinputfieldname',
              validation: Option.none()
            }),
            renderUiLabel({
              html: 'A stand alone label, should not have children',
              name: 'thelabel'
            }, sharedBackstage)
          ]
        }, sharedBackstage)
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('label', {
              classes: [ arr.has('tox-label'), arr.has('tox-label-group') ],
              children: [
                s.text(str.is('Group of Options')),
                s.element('label', {
                  classes: [ arr.has('tox-checkbox') ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-form__group') ]
                }),
                s.element('label', {
                  classes: [ arr.has('tox-label') ],
                  html: str.is('A stand alone label, should not have children')
                })
              ]
            });
          }),
          component.element()
        ),
      ];
    },
    success,
    failure
  );
});