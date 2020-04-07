import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';
import { Option } from '@ephox/katamari';

import { renderSelectBox } from 'tinymce/themes/silver/ui/dialog/SelectBox';
import { DomSteps } from '../../../module/DomSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Selectbox with size component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderSelectBox({
        name: 'selector',
        size: 5,
        label: Option.some('selector'),
        disabled: false,
        items: [
          { value: 'one', text: 'One' },
          { value: 'two', text: 'Two' },
          { value: 'three', text: 'Three' },
          { value: 'four', text: 'Four' },
          { value: 'five', text: 'Five' }
        ]
      }, TestProviders)
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          classes: [ arr.has('tox-form__group') ],
          children: [
            s.element('label', {
              classes: [ arr.has('tox-label') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-selectfield') ],
              children: [
                s.element('select', {
                  attrs: {
                    size: str.is('5')
                  },
                  children: [
                    s.element('option', { value: str.is('one'), html: str.is('One') }),
                    s.element('option', { value: str.is('two'), html: str.is('Two') }),
                    s.element('option', { value: str.is('three'), html: str.is('Three') }),
                    s.element('option', { value: str.is('four'), html: str.is('Four') }),
                    s.element('option', { value: str.is('five'), html: str.is('Five') })
                  ]
                })
              ]
            })
          ]
        })),
        component.element()
      ),

      RepresentingSteps.sSetValue('Choosing three', component, 'three'),
      DomSteps.sAssertValue('After setting "three"', 'three', component, 'select'),
      RepresentingSteps.sAssertComposedValue('Checking is three', 'three', component)
    ],
    success,
    failure
  );
});
