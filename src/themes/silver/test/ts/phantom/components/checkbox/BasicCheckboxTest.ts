import { ApproxStructure, Assertions, Chain, Logger, Step, UiFinder } from '@ephox/agar';
import { GuiFactory, Representing } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { HTMLInputElement } from '@ephox/dom-globals';

import { renderCheckbox } from '../../../../../main/ts/ui/general/Checkbox';
import { GuiSetup } from '../../../module/AlloyTestUtils';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('Checkbox component Test', (success, failure) => {
  const providers = {
    icons: () => <Record<string, string>> {},
    menuItems: () => <Record<string, any>> {},
    translate: I18n.translate
  };

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderCheckbox({
          label: 'TestCheckbox',
          name: 'test-check-box'
        }, providers)
      );
    },
    (doc, body, gui, component, store) => {

      const sAssertCheckboxState = (label: string, expChecked: boolean, expIndeterminate: boolean) => {
        return Logger.t(
          label,
          Chain.asStep(component.element(), [
            UiFinder.cFindIn('input'),
            Chain.op((input) => {
              const node = input.dom() as HTMLInputElement;
              Assertions.assertEq('Checking "checked" flag', expChecked, node.checked);
              Assertions.assertEq('Checking "indeterminate" flag', expIndeterminate, node.indeterminate);
            })
          ])
        );
      };

      const sSetCheckboxState = (state: string) => Step.sync(() => {
        Representing.setValue(component, state);
      });

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
                    }),
                    s.element('span', {
                      classes: [ arr.has('tox-icon'), arr.has('tox-checkbox-icon__indeterminate') ],
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

        sAssertCheckboxState('Initial checkbox state', false, false),
        sSetCheckboxState('checked'),
        sAssertCheckboxState('initial > checked', true, false),
        sSetCheckboxState('indeterminate'),
        sAssertCheckboxState('checked > indeterminate (preserves checked state)', true, true),
        sSetCheckboxState('unchecked'),
        sAssertCheckboxState('indeterminate > unchecked', false, false),
        sSetCheckboxState('indeterminate'),
        sAssertCheckboxState('unchecked > indeterminate (preserves checked state)', false, true),
        sSetCheckboxState('checked'),
        sAssertCheckboxState('indeterminate > checked', true, false)
      ];
    },
    success,
    failure
  );
});