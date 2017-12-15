import { GeneralSteps } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { Step } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Streaming from 'ephox/alloy/api/behaviour/Streaming';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Objects } from '@ephox/boulder';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('StreamingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          tag: 'input'
        },
        containerBehaviours: Behaviour.derive([
          Streaming.config({
            stream: {
              mode: 'throttle',
              delay: 500
            },
            event: 'click',
            onStream: store.adder('onStream')
          })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input'),
          Step.wait(10)
        ])
      ),

      Step.wait(500),
      store.sAssertEq('Should have only fired one event', [ 'onStream' ]),

      GeneralSteps.sequenceRepeat(
        5,
        GeneralSteps.sequence([
          Mouse.sClickOn(gui.element(), 'input'),
          Step.wait(10)
        ])
      ),
      Step.wait(500),
      store.sAssertEq('Should have only fired two events', [ 'onStream', 'onStream' ])
    ];
  }, function () { success(); }, failure);
});

