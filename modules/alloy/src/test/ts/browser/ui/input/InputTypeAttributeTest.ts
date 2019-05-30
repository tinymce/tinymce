import { ApproxStructure, Assertions, GeneralSteps, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Input } from 'ephox/alloy/api/ui/Input';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Tagger from 'ephox/alloy/registry/Tagger';

UnitTest.asynctest('InputTypeAttributeTest', (success, failure) => {

  const platform = PlatformDetection.detect();

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Input.sketch({
        inputAttributes: { type: 'number' }
      })
    );

  }, (doc, body, gui, component, store) => {
    const testStructure = Step.sync(() => {
      Assertions.assertStructure(
        'Checking initial structure of input',
        ApproxStructure.build((s, str, arr) => {
          return s.element('input', {
            attrs: {
              'type': str.is('number')
            }
          });
        }),
        component.element()
      );
    });

    return [
      testStructure
    ];
  }, success, failure);
});