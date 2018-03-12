import { Assertions, Chain, GeneralSteps, Logger, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Fun } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Sandboxing } from 'ephox/alloy/api/behaviour/Sandboxing';
import * as AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import { Container } from 'ephox/alloy/api/ui/Container';
import Input from 'ephox/alloy/api/ui/Input';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';

UnitTest.asynctest('SandboxingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return Sinks.fixedSink();
  }, function (doc, body, gui, sink, store) {
    const sandbox = sink.getSystem().build(
      Container.sketch({
        dom: {
          classes: [ 'test-sandbox' ]
        },
        uid: 'no-duplicates',
        containerBehaviours: Behaviour.derive([
          Sandboxing.config({
            getAttachPoint () {
              return sink;
            },

            onOpen: store.adder('onOpen'),
            onClose: store.adder('onClose'),

            isPartOf: Fun.constant(false)
          })
        ])
      })
    );

    const sOpenWith = function (data) {
      return Step.sync(function () {
        Sandboxing.open(sandbox, data);
      });
    };

    const sClose = Step.sync(function () {
      Sandboxing.close(sandbox);
    });

    const sCheckShowing = function (label, expected) {
      return Step.sync(function () {
        Assertions.assertEq(
          label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be open',
          expected,
          Sandboxing.isOpen(sandbox)
        );
      });
    };

    const sCheckOpenState = function (label, expected) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          sCheckShowing(label, true),
          UiFinder.sExists(gui.element(), 'input[data-test-input="' + expected.data + '"]'),
          UiFinder.sExists(gui.element(), '.test-sandbox'),
          store.sAssertEq('Checking store', expected.store),
          store.sClear,
          Step.sync(function () {
            const state = Sandboxing.getState(sandbox);
            Assertions.assertEq(label + '\nChecking state node name', 'input', Node.name(state.getOrDie().element()));
          })
        ])
      );
    };

    const sCheckClosedState = function (label, expected) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          sCheckShowing(label, false),
          UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
          UiFinder.sNotExists(gui.element(), '.test-sandbox'),
          store.sAssertEq(label, expected.store),
          store.sClear,
          Step.sync(function () {
            const state = Sandboxing.getState(sandbox);
            Assertions.assertEq(label + '\nChecking state is not set', true, state.isNone());
          })
        ])
      );
    };

    const makeData = function (rawData) {
      return Input.sketch({
        uid: rawData,
        inputAttributes: {
          'data-test-input': rawData
        }
      });
    };

    const firstOpening = makeData('first-opening');
    const secondOpening = makeData('second-opening');

    return [
      // initially
      sCheckClosedState('Initial state', { store: [ ] }),

      // // opening sandbox
      Logger.t('Opening sandbox', sOpenWith(firstOpening)),
      sCheckOpenState('Opening sandbox', { data: 'first-opening', store: [ 'onOpen' ] }),

      // // opening sandbox again
      Logger.t('Opening sandbox while it is already open', sOpenWith(secondOpening)),
      sCheckOpenState('Opening sandbox while it is already open', {
        data: 'second-opening',
        store: [ 'onOpen' ]
      }),

      // closing sandbox again
      Logger.t('Closing sandbox 2', sClose),
      sCheckClosedState('After closing 2', { store: [ 'onClose' ] }),

      Logger.t('Opening sandbox with a uid that has already been used: try and re-open firstOpening', sOpenWith(firstOpening)),
      sCheckOpenState('Opening sandbox with a uid that has already been used', {
        data: 'first-opening',
        store: [ 'onOpen' ]
      }),

      Logger.t(
        'Firing sandbox close system event',

        Chain.asStep({}, [
          Chain.inject(sandbox.element()),
          UiFinder.cFindIn('input'),
          Chain.op(function (input) {
            AlloyTriggers.dispatch(sandbox, input, SystemEvents.sandboxClose());
          })
        ])
      ),

      sCheckClosedState('After sending system close event', { store: [ 'onClose' ] })
    ];
  }, function () { success(); }, failure);
});
