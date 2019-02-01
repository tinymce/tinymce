import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';
import { renderLabel } from 'tinymce/themes/silver/ui/dialog/Label';

UnitTest.asynctest('Ui Label component Test', (success, failure) => {
  const helpers = setupDemo();
  const sharedBackstage = helpers.extras.backstage.shared;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderLabel({
          type: 'label',
          label: 'Group of Options',
          items: [
            {
              dom: {
                tag: 'label',
                classes: ['tox-checkbox']
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
            return s.element('div', {
              classes: [ arr.has('tox-form__group') ],
              children: [
                s.element('label', {
                  children: [
                    s.text(str.is('Group of Options')),
                  ]
                }),
                s.element('label', {
                  classes: [ arr.has('tox-checkbox') ]
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