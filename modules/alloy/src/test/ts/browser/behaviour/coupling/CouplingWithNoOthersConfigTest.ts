import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Coupling } from 'ephox/alloy/api/behaviour/Coupling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as StepUtils from 'ephox/alloy/test/StepUtils';

UnitTest.asynctest('CouplingWithNoOthersConfigTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      uid: 'primary',
      containerBehaviours: Behaviour.derive([
        Coupling.config({
          others: { }
        })
      ])
    })
  ), (_doc, _body, _gui, component, _store) => [
    StepUtils.sAssertFailContains(
      'Testing getCoupled with invalid name: anything',
      'Cannot find any known coupled components',
      () => {
        Coupling.getCoupled(component, 'anything');
      }
    ),

    StepUtils.sAssertFailContains(
      'Testing getExistingCoupled with invalid name: anything',
      'Cannot find any known coupled components',
      () => {
        Coupling.getExistingCoupled(component, 'anything');
      }
    )
  ], success, failure);
});
