import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { setupDemo } from 'src/themes/silver/demo/ts/components/DemoHelpers';
import { renderUiLabel } from 'tinymce/themes/silver/ui/general/UiLabel';

import { GuiSetup } from '../../../module/AlloyTestUtils';

UnitTest.asynctest('Ui Label component Test', (success, failure) => {
  const helpers = setupDemo();
  const sharedBackstage = helpers.extras.backstage.shared;

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderUiLabel({
          type: 'label',
          label: 'Group of Options',
          items: [
            {
              dom: {
                tag: 'label',
                classes: ['tox-checkbox']
              }
            } as any,
            {
              dom: {
                tag: 'div',
                classes: ['tox-form__group']
              }
            } as any
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
              classes: [ arr.has('tox-label') ],
              children: [
                s.text(str.is('Group of Options')),
                s.element('label', {
                  classes: [ arr.has('tox-checkbox') ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-form__group') ]
                })
              ]
            });
          }),
          component.element()
        )
      ];
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});