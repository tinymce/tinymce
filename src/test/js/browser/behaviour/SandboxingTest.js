import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Sandboxing from 'ephox/alloy/api/behaviour/Sandboxing';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import Container from 'ephox/alloy/api/ui/Container';
import Input from 'ephox/alloy/api/ui/Input';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import Sinks from 'ephox/alloy/test/Sinks';
import { Fun } from '@ephox/katamari';
import { LazyValue } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('SandboxingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return Sinks.fixedSink();
  }, function (doc, body, gui, sink, store) {
    var sandbox = sink.getSystem().build(
      Container.sketch({
        dom: {
          classes: [ 'test-sandbox' ]
        },
        uid: 'no-duplicates',
        containerBehaviours: Behaviour.derive([
          Sandboxing.config({
            getAttachPoint: function () {
              return sink;
            },

            onOpen: store.adder('onOpen'),
            onClose: store.adder('onClose'),

            isPartOf: Fun.constant(false)
          })
        ])
      })
    );

    var sOpenWith = function (data) {
      return Step.sync(function () {
        Sandboxing.open(sandbox, data);
      });
    };

    var sClose = Step.sync(function () {
      Sandboxing.close(sandbox);
    });

    var sCheckShowing = function (label, expected) {
      return Step.sync(function () {
        Assertions.assertEq(
          label + '\nSandbox should ' + (expected === false ? '*not* ' : '') + 'be open',
          expected,
          Sandboxing.isOpen(sandbox)
        );
      });
    };

    var sCheckOpenState = function (label, expected) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          sCheckShowing(label, true),
          UiFinder.sExists(gui.element(), 'input[data-test-input="' + expected.data + '"]'),
          UiFinder.sExists(gui.element(), '.test-sandbox'),
          store.sAssertEq('Checking store', expected.store),
          store.sClear,
          Step.sync(function () {
            var state = Sandboxing.getState(sandbox);
            Assertions.assertEq(label + '\nChecking state node name', 'input', Node.name(state.getOrDie().element()));
          })
        ])
      );
    };

    var sCheckClosedState = function (label, expected) {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          sCheckShowing(label, false),
          UiFinder.sNotExists(gui.element(), 'input[data-test-input]'),
          UiFinder.sNotExists(gui.element(), '.test-sandbox'),
          store.sAssertEq(label, expected.store),
          store.sClear,
          Step.sync(function () {
            var state = Sandboxing.getState(sandbox);
            Assertions.assertEq(label + '\nChecking state is not set', true, state.isNone());
          })
        ])
      );
    };

    var makeData = function (rawData) {
      return Input.sketch({
        uid: rawData,
        inputAttributes: {
          'data-test-input': rawData
        }
      });
    };

    var firstOpening = makeData('first-opening');
    var secondOpening = makeData('second-opening');

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

