import { ApproxStructure, Assertions, Chain, Keyboard, Keys, Logger, Step, UiFinder } from '@ephox/agar';
import { GuiFactory, Representing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { HTMLInputElement } from '@ephox/dom-globals';

import { renderCheckbox } from 'tinymce/themes/silver/ui/general/Checkbox';
import I18n from 'tinymce/core/api/util/I18n';
import { DisablingSteps } from '../../../module/DisablingSteps';

UnitTest.asynctest('Checkbox component Test', (success, failure) => {
  const providers = {
    icons: () => <Record<string, string>> {
      selected: '<svg></svg>',
      unselected: '<svg></svg>'
    },
    menuItems: () => <Record<string, any>> {},
    translate: I18n.translate
  };

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderCheckbox({
          label: 'TestCheckbox',
          name: 'test-check-box',
          disabled: false
        }, providers)
      );
    },
    (doc, body, gui, component, store) => {

      const sAssertCheckboxState = (label: string, expChecked: boolean) => {
        return Logger.t(
          label,
          Chain.asStep(component.element(), [
            UiFinder.cFindIn('input'),
            Chain.op((input) => {
              const node = input.dom() as HTMLInputElement;
              Assertions.assertEq('Checking "checked" flag', expChecked, node.checked);
              Assertions.assertEq('Checking "indeterminate" flag', false, node.indeterminate);
            })
          ])
        );
      };

      const sSetCheckboxState = (state: boolean) => Step.sync(() => {
        Representing.setValue(component, state);
      });

      const sPressKeyOnCheckbox = (keyCode: number, modifiers: object) => {
        return Chain.asStep(component.element(), [
          UiFinder.cFindIn('input'),
          Chain.op((input) => {
            Keyboard.keydown(keyCode, modifiers, input);
          })
        ]);
      };

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('label', {
              classes: [ arr.has('tox-checkbox') ],
              children: [
                s.element('input', {
                  classes: [ arr.has('tox-checkbox__input') ],
                  attrs: {
                    type: str.is('checkbox')
                  }
                }),
                s.element('div', {
                  classes: [ arr.has('tox-checkbox__icons') ],
                  children: [
                    s.element('span', {
                      classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__checked') ],
                      html: str.startsWith('<svg')
                    }),
                    s.element('span', {
                      classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__unchecked') ],
                      html: str.startsWith('<svg')
                    })
                  ]
                }),
                s.element('span', {
                  classes: [ arr.has('tox-checkbox__label') ],
                  html: str.is('TestCheckbox')
                })
              ]
            });
          }),
          component.element()
        ),

        // Representing state updates
        sAssertCheckboxState('Initial checkbox state', false),
        DisablingSteps.sAssertDisabled('Initial disabled state', false, component),
        sSetCheckboxState(true),
        sAssertCheckboxState('initial > checked', true),
        sSetCheckboxState(false),
        sAssertCheckboxState('checked > unchecked', false),
        sSetCheckboxState(true),
        sAssertCheckboxState('unchecked > checked', true),

        // Disabling state
        DisablingSteps.sSetDisabled('set disabled', component, true),
        DisablingSteps.sAssertDisabled('enabled > disabled', true, component),
        DisablingSteps.sSetDisabled('set enabled', component, false),
        DisablingSteps.sAssertDisabled('disabled > enabled', false, component),

        // Keyboard events
        sPressKeyOnCheckbox(Keys.space(), { }),
        sAssertCheckboxState('checked > unchecked', false),
        sPressKeyOnCheckbox(Keys.space(), { }),
        sAssertCheckboxState('unchecked > checked', true),
        sPressKeyOnCheckbox(Keys.enter(), { }),
        sAssertCheckboxState('checked > unchecked', false),
        sPressKeyOnCheckbox(Keys.enter(), { }),
        sAssertCheckboxState('unchecked > checked', true)
      ];
    },
    success,
    failure
  );
});
