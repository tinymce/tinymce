import { ApproxStructure, Assertions, GeneralSteps, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';

import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Input } from 'ephox/alloy/api/ui/Input';

UnitTest.asynctest('InputTest', (success, failure) => {

  const platform = PlatformDetection.detect();

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Input.sketch({
      inputAttributes: { placeholder: 'placeholder-text' },
      data: 'initial-value',
      uid: 'test-input-id',
      inputClasses: [ 'extra-class' ]
    })
  ), (_doc, _body, _gui, component, _store) => {
    const testStructure = Step.sync(() => {
      Assertions.assertStructure(
        'Checking initial structure of input',
        ApproxStructure.build((s, str, arr) => s.element('input', {
          attrs: {
            'type': str.is('text'),
            'data-alloy-id': str.none(),
            'placeholder': str.is('placeholder-text')
          },
          classes: [
            arr.has('extra-class')
          ],
          value: str.is('initial-value')
        })),
        component.element()
      );
    });

    const sCheckInputSelection = (label: string, expected: { start: number; end: number }) => Step.sync(() => {
      Assertions.assertEq(
        label + '\nChecking selectionStart',
        expected.start,
        component.element().dom().selectionStart
      );
      Assertions.assertEq(
        label + '\nChecking selectionEnd',
        expected.end,
        component.element().dom().selectionEnd
      );
    });

    const defaultCursor = platform.browser.isChrome() || platform.browser.isSafari() || platform.browser.isFirefox() ? 'Initial Value'.length : 0;

    const testFocus = Logger.t(
      'Testing input.focus selects text inside',
      GeneralSteps.sequence([
        sCheckInputSelection('before focus', { start: defaultCursor, end: defaultCursor }),
        Step.sync(() => {
          Focusing.focus(component);
        }),
        sCheckInputSelection('after focus', { start: 0, end: 'initial Value'.length })

      ])
    );

    const testRepresenting = Logger.t(
      'Checking that representing is working',
      Step.sync(() => {
        const data = Representing.getValue(component);
        Assertions.assertEq('Checking getValue', 'initial-value', data);
        Representing.setValue(component, 'v');
        const newData = Representing.getValue(component);
        Assertions.assertEq('Checking getValue after setValue', 'v', newData);
        Assertions.assertStructure(
          'Checking new structure of input',
          ApproxStructure.build((s, str, _arr) => s.element('input', {
            attrs: {
              'type': str.is('text'),
              'data-alloy-id': str.none(),
              'placeholder': str.is('placeholder-text')
            },
            value: str.is('v')
          })),
          component.element()
        );
      })

    );

    return [
      testStructure,
      testFocus,
      testRepresenting
    ];
  }, success, failure);
});
