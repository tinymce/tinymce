import { FocusTools, Keyboard, Keys } from '@ephox/agar';
import { AddEventsBehaviour, AlloyEvents, Behaviour, GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';

import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import { FormChangeEvent, formChangeEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import TestProviders from '../../../module/TestProviders';

describe('phantom.tinymce.themes.silver.components.checkbox.CheckboxFormChangeTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build({
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
  }));

  it('Form change event should fire when the checkbox is toggled via the keyboard', () => {
    FocusTools.setFocus(hook.body(), '.tox-checkbox__input');
    Keyboard.activeKeydown(hook.root(), Keys.enter());
    hook.store().assertEq('Form change should have fired', [ 'test-check-box' ]);
  });
});
