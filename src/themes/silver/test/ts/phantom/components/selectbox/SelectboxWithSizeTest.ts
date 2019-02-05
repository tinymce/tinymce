import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';
import { Option } from '@ephox/katamari';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';

import { renderSelectBox } from '../../../../../main/ts/ui/dialog/SelectBox';
import { DomSteps } from '../../../module/DomSteps';
import { RepresentingSteps } from '../../../module/ReperesentingSteps';

UnitTest.asynctest('Selectbox with size component Test', (success, failure) => {

  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderSelectBox({
          type: 'selectbox',
          name: 'selector',
          size: 5,
          label: Option.some('selector'),
          items: [
            { value: 'one', text: 'One' },
            { value: 'two', text: 'Two' },
            { value: 'three', text: 'Three' },
            { value: 'four', text: 'Four'},
            { value: 'five', text: 'Five'}
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
                      attrs: {
                        size: str.is('5')
                      },
                      children: [
                        s.element('option', { value: str.is('one'), html: str.is('One') }),
                        s.element('option', { value: str.is('two'), html: str.is('Two') }),
                        s.element('option', { value: str.is('three'), html: str.is('Three')}),
                        s.element('option', { value: str.is('four'), html: str.is('Four') }),
                        s.element('option', { value: str.is('five'), html: str.is('Five') })
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
      helpers.destroy();
      success();
    },
    failure
  );
});