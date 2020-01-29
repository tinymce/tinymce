import { GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Element, EventArgs } from '@ephox/sugar';

import * as NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import * as SystemEvents from 'ephox/alloy/api/events/SystemEvents';
import TestStore from 'ephox/alloy/api/testhelpers/TestStore';
import * as TapEvent from 'ephox/alloy/events/TapEvent';

UnitTest.asynctest('browser events.TapEventsTest', (success, failure) => {
  // Needs to be browser because it uses DOM comparison

  const store = TestStore();

  const monitor = TapEvent.monitor({
    triggerEvent (name) {
      store.adder(name)();
      return true;
    },
  });

  const alpha = Element.fromText('alpha');

  const touches = (x: number, y: number, target: Element) => {
    return {
      raw: Fun.constant({
        touches: [
          { clientX: x, clientY: y }
        ]
      }),
      target: Fun.constant(target)
    } as EventArgs;
  };

  const sFireIfReady = (event: EventArgs, type: string) => {
    return Step.sync(() => {
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
        Waiter.sTryUntil('After touch start > major movement > wait = no longpress', store.sAssertEq('[]', [])),
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

        Waiter.sTryUntil('After touch start > major movement > wait = no longpress', store.sAssertEq('', [
          SystemEvents.longpress()
        ])),
        store.sClear
      ])
    )
  ], () => { success(); }, failure);
});
