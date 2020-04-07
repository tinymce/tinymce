import { Logger, Pipeline, Step, ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { HtmlSelect } from 'ephox/alloy/api/ui/HtmlSelect';
import * as RepresentPipes from 'ephox/alloy/test/behaviour/RepresentPipes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('HtmlSelectTest', (success, failure) => {

  const sNoInitialValue = Step.async((next, die) => {
    GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
      HtmlSelect.sketch({
        dom: { }, // is always a select

        options: [
          { value: 'alpha', text: 'Alpha' },
          { value: 'beta', text: 'Beta' },
          { value: 'gamma', text: 'Gamma' }
        ]
      })
    ), (_doc, _body, _gui, component, _store) => [
      RepresentPipes.sAssertValue('Checking initial value', 'alpha', component),
      RepresentPipes.sSetValue(component, 'beta'),
      RepresentPipes.sAssertValue('Checking value after valid set', 'beta', component),
      RepresentPipes.sSetValue(component, 'delta'),
      RepresentPipes.sAssertValue('Checking value after invalid set (should still be on beta)', 'beta', component),
      RepresentPipes.sSetValue(component, 'gamma'),
      RepresentPipes.sAssertValue('Checking value after valid set (should now be gamma)', 'gamma', component)
    ], next, die);
  });

  const sHasInitialValue = Step.async((next, die) => {
    GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
      HtmlSelect.sketch({
        dom: { }, // is always a select
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
    ), (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
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
        component.element()
      ),

      RepresentPipes.sAssertValue('Checking initial value', 'gamma', component),
      RepresentPipes.sSetValue(component, 'beta'),
      RepresentPipes.sAssertValue('Checking value after valid set', 'beta', component),
      RepresentPipes.sSetValue(component, 'delta'),
      RepresentPipes.sAssertValue('Checking value after invalid set (should still be on beta)', 'beta', component),
      RepresentPipes.sSetValue(component, 'gamma'),
      RepresentPipes.sAssertValue('Checking value after valid set (should now be gamma)', 'gamma', component),
      RepresentPipes.sSetValue(component, 'alpha'),
      RepresentPipes.sAssertValue('Checking value after valid set (should now be alpha)', 'alpha', component)
    ], next, die);
  });

  Pipeline.async({}, [
    Logger.t('Scenario: no initial value', sNoInitialValue),
    Logger.t('Scenario: has initial value gamma', sHasInitialValue)
  ], () => { success(); }, failure);
});
