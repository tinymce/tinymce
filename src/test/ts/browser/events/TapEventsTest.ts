import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import TapEvent from 'ephox/alloy/events/TapEvent';
import TestStore from 'ephox/alloy/test/TestStore';
import { Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser events.TapEventsTest', function() {
  // Needs to be browser because it uses DOM comparison
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var store = TestStore();

  var monitor = TapEvent.monitor({
    triggerEvent: function (name) {
      store.adder(name)();
    }
  });

  var alpha = Element.fromText('alpha');
  var beta = Element.fromText('beta');
  var gamma = Element.fromText('gamma');

  var touches = function (x, y, target) {
    return {
      raw: Fun.constant({
        touches: [
          { clientX: x, clientY: y }
        ]
      }),
      target: Fun.constant(target)
    };
  };

  var sFireIfReady = function (event, type) {
    return Step.sync(function () {
      monitor.fireIfReady(event, type);
    });
  };

  Pipeline.async({ }, [
    Logger.t(
      'Checking tapping',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchend()
        ),
        store.sAssertEq('After touch start > no move > touchend = tap', [
          SystemEvents.tap()
        ]),
        store.sClear
      ])
    ),

    Logger.t(
      'Checking tapping even though minor movement',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),
        sFireIfReady(
          touches(3, 3, alpha),
          NativeEvents.touchmove()
        ),
        store.sAssertEq('After touch move, empty', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchend()
        ),
        store.sAssertEq('After touch start > minor movement > touchend = tap', [
          SystemEvents.tap()
        ]),
        store.sClear
      ])
    ),

    Logger.t(
      'Checking tapping cancelled by several small movements',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),
        sFireIfReady(
          touches(3, 3, alpha),
          NativeEvents.touchmove()
        ),
        store.sAssertEq('After touch move 1, empty', [ ]),

        sFireIfReady(
          touches(6, 6, alpha),
          NativeEvents.touchmove()
        ),
        store.sAssertEq('After touch move 2, empty', [ ]),


        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchend()
        ),
        store.sAssertEq('After touch start > several small movements > touchend = no tap', [ ]),
        store.sClear
      ])
    ),

    Logger.t(
      'Checking tapping cancelled by large movement',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),
        sFireIfReady(
          touches(10, 10, alpha),
          NativeEvents.touchmove()
        ),
        store.sAssertEq('After touch move, empty', [ ]),

        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchend()
        ),
        store.sAssertEq('After touch start > major movement > touchend = no tap', [ ]),
        store.sClear
      ])
    ),

    Logger.t(
      'Checking longpress cancelled by large movement',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),
        sFireIfReady(
          touches(10, 10, alpha),
          NativeEvents.touchmove()
        ),
        store.sAssertEq('After touch move, empty', [ ]),

        Step.wait(1000),
        store.sAssertEq('After touch start > major movement > wait = no longpress', [ ]),
        store.sClear
      ])
    ),

    Logger.t(
      'Checking longpress',
      GeneralSteps.sequence([
        store.sAssertEq('Initially empty store', [ ]),
        sFireIfReady(
          touches(0, 0, alpha),
          NativeEvents.touchstart()
        ),
        store.sAssertEq('After touch start, empty', [ ]),

        Step.wait(1000),
        store.sAssertEq('After touch start > major movement > wait = no longpress', [
          SystemEvents.longpress()
        ]),
        store.sClear
      ])
    )
  ], function () { success(); }, failure);
});

