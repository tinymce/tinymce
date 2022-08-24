import { Assertions, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Attribute, SugarNode } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Coupling } from 'ephox/alloy/api/behaviour/Coupling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as Tagger from 'ephox/alloy/registry/Tagger';
import * as StepUtils from 'ephox/alloy/test/StepUtils';

UnitTest.asynctest('CouplingTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      uid: 'primary',
      containerBehaviours: Behaviour.derive([
        Coupling.config({
          others: {
            'secondary-1': (primary) => {
              return Button.sketch({
                dom: {
                  tag: 'button'
                },
                action: store.adder('clicked on coupled button of: ' + Tagger.read(primary.element).getOr('No UID'))
              });
            }
          }
        })
      ])
    })
  ), (_doc, _body, gui, component, store) => [
    StepUtils.sAssertFailContains(
      'Testing getCoupled with invalid name: fake',
      'No information found for coupled component: fake',
      () => {
        Coupling.getCoupled(component, 'fake');
      }
    ),

    StepUtils.sAssertFailContains(
      'Testing getExistingCoupled with invalid name: fake',
      'No information found for coupled component: fake',
      () => {
        Coupling.getExistingCoupled(component, 'fake');
      }
    ),

    Logger.t(
      'Testing getCoupled and getExistingCoupled with valid name: secondary-1',
      Step.sync(() => {
        const existingSecondary1 = Coupling.getExistingCoupled(component, 'secondary-1');
        Assertions.assertEq('secondary1 should not exist yet', true, existingSecondary1.isNone());

        const secondary1 = Coupling.getCoupled(component, 'secondary-1');
        const postCreateExistingSecondary1 = Coupling.getExistingCoupled(component, 'secondary-1');
        Assertions.assertEq('secondary1 should now exist', true, postCreateExistingSecondary1.isSome());
        const button1 = secondary1.element;
        Assertions.assertEq('secondary1 should be a button', 'button', SugarNode.name(button1));
        Attribute.set(button1, 'data-test', 'marked');

        Assertions.assertEq(
          'secondary1 is not recreated. Should still have attribute: data-test',
          'marked',
          Attribute.get(Coupling.getCoupled(component, 'secondary-1').element, 'data-test')
        );
      })
    ),

    store.sAssertEq('Should be nothing on the store', [ ]),
    Step.sync(() => {
      const secondary1 = Coupling.getCoupled(component, 'secondary-1');
      gui.add(secondary1);
      secondary1.element.dom.click();
    }),
    store.sAssertEq(
      'After clicking, store should have message',
      [ 'clicked on coupled button of: primary' ]
    )
  ], success, failure);
});
