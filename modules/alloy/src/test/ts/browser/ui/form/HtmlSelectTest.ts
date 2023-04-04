import { ApproxStructure, Assertions } from '@ephox/agar';
import { Assert, context, describe, it } from '@ephox/bedrock-client';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';

describe('HtmlSelectTest', () => {
  const simpleAssert = (label: string, expected: any, component: AlloyComponent) =>
    Assert.eq(label, expected, Representing.getValue(component));

  context('no initial value', () => {
    const store = GuiSetup.bddSetup(
      () => GuiFactory.build(
        HtmlSelect.sketch({
          dom: {}, // is always a select

          options: [
            { value: 'alpha', text: 'Alpha' },
            { value: 'beta', text: 'Beta' },
            { value: 'gamma', text: 'Gamma' }
          ]
        })
      )
    );

    it('TBA: Should set/get the selected value using the Representing', () => {
      const component = store.component();

      simpleAssert('Checking initial value', 'alpha', component);
      Representing.setValue(component, 'beta');
      simpleAssert('Checking value after valid set', 'beta', component);
      Representing.setValue(component, 'delta');
      simpleAssert('Checking value after invalid set (should still be on beta)', 'beta', component);
      Representing.setValue(component, 'gamma');
      simpleAssert('Checking value after valid set (should now be gamma)', 'gamma', component);
    });

    it('TINY-9679: The options are changed and the selection reset', () => {
      const component = store.component();

      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str) => s.element('select', {
          children: [
            s.element('option', { value: str.is('alpha'), html: str.is('Alpha') }),
            s.element('option', { value: str.is('beta'), html: str.is('Beta') }),
            s.element('option', { value: str.is('gamma'), html: str.is('Gamma') })
          ]
        })),
        component.element
      );

      // component is reused from previous test, and starts on gamma.
      simpleAssert('Checking initial value', 'gamma', component);
      Representing.setValue(component, '');
      simpleAssert('Checking initial value', 'gamma', component);
      component.element.dom.value = null;
      Representing.setValue(component, '');
      simpleAssert('Checking value after valid set (should now be alpha)', 'alpha', component);
    });
  });

  context('Has initial value gamma', () => {
    const store = GuiSetup.bddSetup(
      () => GuiFactory.build(
        HtmlSelect.sketch({
          dom: {}, // is always a select
          selectAttributes: {
            size: 10
          },
          selectClasses: [ 'my-test-select' ],
          data: 'gamma',
          options: [
            { value: 'alpha', text: 'Alpha' },
            { value: 'beta', text: 'Beta' },
            { value: 'gamma', text: 'Gamma' }
          ]
        })
      )
    );

    it('TBA: Correctly starts on the expected value, and changes when prompted as normal', () => {
      const component = store.component();

      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('select', {
          attrs: {
            size: str.is('10')
          },
          classes: [ arr.has('my-test-select') ],
          children: [
            s.element('option', { value: str.is('alpha'), html: str.is('Alpha') }),
            s.element('option', { value: str.is('beta'), html: str.is('Beta') }),
            s.element('option', { value: str.is('gamma'), html: str.is('Gamma') })
          ]
        })),
        component.element
      );

      simpleAssert('Checking initial value', 'gamma', component);
      Representing.setValue(component, 'beta');
      simpleAssert('Checking value after valid set', 'beta', component);
      Representing.setValue(component, 'delta');
      simpleAssert('Checking value after invalid set (should still be on beta)', 'beta', component);
      Representing.setValue(component, 'gamma');
      simpleAssert('Checking value after valid set (should now be gamma)', 'gamma', component);
      Representing.setValue(component, 'alpha');
      simpleAssert('Checking value after valid set (should now be alpha)', 'alpha', component);
    });
  });
});
