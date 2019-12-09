import { Step, GeneralSteps, Logger, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('ComponentApisTest', (success, failure) => {
  interface TestApiInterface {
    doFirstThing: () => void;
    doSecondThing: () => void;
    doThirdThing: () => string;
  }
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'component-with-api' ]
      },
      apis: {
        doFirstThing: store.adder('doFirstThing'),
        doSecondThing: store.adder('doSecondThing'),
        doThirdThing: () => 'thirdThing'
      }
    });
  }, (doc, body, gui, component, store) => {
    return [
      Logger.t('Testing "doFirstThing"', GeneralSteps.sequence([
        store.sAssertEq('No APIs have been called yet', [ ]),
        Step.sync(() => {
          component.getApis<TestApiInterface>().doFirstThing();
        }),
        store.sAssertEq('First thing API should have been called', [ 'doFirstThing' ]),
        store.sClear
      ])),

      Logger.t('Testing "doSecondThing"', GeneralSteps.sequence([
        Step.sync(() => {
          component.getApis<TestApiInterface>().doSecondThing();
        }),
        store.sAssertEq('Second thing API should have been called', [ 'doSecondThing' ]),
        store.sClear
      ])),

      Logger.t('Testing "doThirdThing"', GeneralSteps.sequence([
        Step.sync(() => {
          const value = component.getApis<TestApiInterface>().doThirdThing();
          Assertions.assertEq('Checking api return value', 'thirdThing', value);
        })
      ]))
    ];
  }, success, failure);
});
