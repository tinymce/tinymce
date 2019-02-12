import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';

import { renderSelectBox } from '../../../../../main/ts/ui/dialog/SelectBox';
import { DomSteps } from '../../../module/DomSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('Selectbox component Test', (success, failure) => {

  const providers = {
    icons: () => <Record<string, string>> {
      'chevron-down': '<svg></svg>'
    },
    menuItems: () => <Record<string, any>> {},
    translate: I18n.translate
  };

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderSelectBox({
          type: 'selectbox',
          name: 'selector',
          size: 1,
          label: Option.some('selector'),
          items: [
            { value: 'one', text: 'One' },
            { value: 'two', text: 'Two' },
            { value: 'three', text: 'Three' },
          ]
        }, providers)
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
                  classes: [ arr.has('tox-label') ]
                }),
                s.element('div', {
                  classes: [arr.has('tox-selectfield')],
                  children: [
                    s.element('select', {
                      value: str.is('one'),
                      attrs: {
                        size: str.is('1')
                      },
                      children: [
                        s.element('option', { value: str.is('one'), html: str.is('One') }),
                        s.element('option', { value: str.is('two'), html: str.is('Two') }),
                        s.element('option', { value: str.is('three'), html: str.is('Three') })
                      ]
                    }),
                    s.element('div', {
                      classes: [arr.has('tox-selectfield__icon-js')],
                      children: [
                        s.element('svg', {})
                      ]
                    })
                  ]
                })
              ]
            });
          }),
          component.element()
        ),

        RepresentingSteps.sSetValue('Choosing three', component, 'three'),
        DomSteps.sAssertValue('After setting "three"', 'three', component, 'select'),
        RepresentingSteps.sAssertComposedValue('Checking is three', 'three', component)
      ];
    },
    () => {
      success();
    },
    failure
  );
});