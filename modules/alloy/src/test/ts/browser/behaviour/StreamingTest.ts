import { GeneralSteps, Mouse, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Streaming } from 'ephox/alloy/api/behaviour/Streaming';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';

UnitTest.asynctest('StreamingTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Streaming.config({
            stream: {
              mode: 'throttle',
              delay: 200
            },
            event: 'click',
            cancelEvent: 'cancel.stream',
            onStream: store.adder('onStream')
          })
        ])
      })
    );

  }, (doc, body, gui, component, store) => {
    return [
      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input')
        ])
      ),

      Step.wait(220),
      store.sAssertEq('Should have only fired one event', [ 'onStream' ]),

      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input')
        ])
      ),
      Step.wait(220),
      store.sAssertEq('Should have only fired two events', [ 'onStream', 'onStream' ]),

      // Wait long enough to ensure everything is gone, and then test "cancelling"
      store.sClear,
      Step.wait(220),
      Mouse.sClickOn(gui.element(), 'input'),
      Step.wait(10),
      Step.sync(() => {
        AlloyTriggers.emit(component, 'cancel.stream');
      }),
      Waiter.sTryUntil('', store.sAssertEq('Event should have been cancelled, so nothing should be in store', [ ])),
    ];
  }, () => { success(); }, failure);
});
