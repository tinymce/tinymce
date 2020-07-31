import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { AddEventsBehaviour, AlloyEvents, Behaviour, GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import { FormChangeEvent, formChangeEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Checkbox component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, _doc, _body) => GuiFactory.build(
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
            AlloyEvents.run<FormChangeEvent<any>>(formChangeEvent, (_component, event) => {
              store.adder(event.event.name)();
            })
          ])
        ])
      }
    ),
    (doc, body, _gui, _component, store) => [
      FocusTools.sSetFocus('Focus checkbox', body, '.tox-checkbox__input'),
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq('Form change should have fired', [ 'test-check-box' ])
    ],
    success,
    failure
  );
});
