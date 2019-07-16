import { Keyboard, FocusTools, Keys } from '@ephox/agar';
import { GuiFactory, Behaviour, AddEventsBehaviour, AlloyEvents, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';

import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import { formChangeEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Checkbox component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        {
          dom: {
            tag: 'div'
          },
          components: [
            renderCheckbox({
              label: 'TestCheckbox',
              name: 'test-check-box',
              disabled: false
            }, TestProviders)
          ],
          behaviours: Behaviour.derive([
            AddEventsBehaviour.config('test-checkbox', [
              AlloyEvents.run(formChangeEvent, (component, event) => {
                store.adder((event.event() as any).name())();
              })
            ])
          ])
        }
      );
    },
    (doc, body, gui, component, store) => {
      return [
        FocusTools.sSetFocus('Focus checkbox', body, '.tox-checkbox__input'),
        Keyboard.sKeydown(doc, Keys.enter(), {}),
        store.sAssertEq('Form change should have fired', ['test-check-box'])
      ];
    },
    success,
    failure
  );
});
