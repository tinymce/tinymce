import { Keyboard } from '@ephox/agar';
import { Keys } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import Keying from 'ephox/alloy/api/behaviour/Keying';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyEvents from 'ephox/alloy/api/events/AlloyEvents';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('ExecutingKeyingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var sTestDefault = Logger.t(
    'Default execution',
    Step.async(function (next, die) {
  
      GuiSetup.setup(function (store, doc, body) {
        return GuiFactory.build(
          Container.sketch({
            dom: {
              classes: [ 'executing-keying-test'],
              styles: {

              }
            },
            containerBehaviours: Behaviour.derive([
              Focusing.config({ }),
              Keying.config({
                mode: 'execution'
              })
            ]),
            events: AlloyEvents.derive([
              AlloyEvents.runOnExecute(store.adder('event.execute'))
            ])
          })
        );

      }, function (doc, body, gui, component, store) {
        return [
          GuiSetup.mSetupKeyLogger(body),
          Step.sync(function () {
            Focusing.focus(component);
          }),
          store.sAssertEq('Initially empty', [ ]),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          store.sAssertEq('Post enter', [ 'event.execute' ]),
          GuiSetup.mTeardownKeyLogger(body, [ ])
        ];
      }, next, die);
    })
  );

  var sTestConfiguration = Logger.t(
    'Testing ctrl+enter and space execute',
    Step.async(function (next, die) {
      GuiSetup.setup(function (store, doc, body) {
        return GuiFactory.build(
          Container.sketch({
            dom: {
              classes: [ 'executing-keying-test'],
              styles: {

              }
            },
            containerBehaviours: Behaviour.derive([
              Focusing.config({ }),
              Keying.config({
                mode: 'execution',
                useControlEnter: true,
                useEnter: false,
                useSpace: true
              })
            ]),
            events: AlloyEvents.derive([
              AlloyEvents.runOnExecute(store.adder('event.execute'))
            ])
          })
        );

      }, function (doc, body, gui, component, store) {
        return [
          GuiSetup.mSetupKeyLogger(body),
          Step.sync(function () {
            Focusing.focus(component);
          }),
          store.sAssertEq('Initially empty', [ ]),
          Keyboard.sKeydown(doc, Keys.enter(), { }),
          store.sAssertEq('Post enter', [ ]),
          Keyboard.sKeydown(doc, Keys.space(), { }),
          store.sAssertEq('Post space', [ 'event.execute' ]),
          Keyboard.sKeydown(doc, Keys.enter(), { ctrl: true }),
          store.sAssertEq('Post ctrl+enter', [ 'event.execute', 'event.execute' ]),
          GuiSetup.mTeardownKeyLogger(body, [
            // Enter was not handled
            'keydown.to.body: 13'
          ])
        ];
      }, next, die);
    })
  );

  Pipeline.async({ }, [
    sTestDefault,
    sTestConfiguration
  ], function () { success(); }, failure);
});

