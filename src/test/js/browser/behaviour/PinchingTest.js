import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Pinching from 'ephox/alloy/api/behaviour/Pinching';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import AlloyTriggers from 'ephox/alloy/api/events/AlloyTriggers';
import NativeEvents from 'ephox/alloy/api/events/NativeEvents';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Fun } from '@ephox/katamari';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('Browser Test: behaviour.PinchingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];


  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build({
      dom: {
        tag: 'div',
        styles: {
          width: '100px',
          height: '100px'
        }
      },
      behaviours: Behaviour.derive([
        Pinching.config({
          onPinch: function (elem, dx, dy) {
            store.adder({ method: 'pinch', dx: dx, dy: dy })();
          },
          onPunch: function (elem, dx, dy) {
            store.adder({ method: 'punch', dx: dx, dy: dy })();
          }
        })
      ])
    });
  }, function (doc, body, gui, component, store) {

    var sSendTouchmove = function (touches) {
      return Step.sync(function () {
        AlloyTriggers.emitWith(component, NativeEvents.touchmove(), {
          raw: { touches: touches }
        });
      });
    };

    return [
      store.sAssertEq('Initially empty', [ ]),

      sSendTouchmove([
        { clientX: 10, clientY: 100 }
      ]),

      sSendTouchmove([
        { clientX: 10, clientY: 100 }
      ]),

      sSendTouchmove([
        { clientX: 10, clientY: 100 }
      ]),

      store.sAssertEq('Should still be empty because there was only one touch point ', [ ]),

      sSendTouchmove([
        { clientX: 10, clientY: 100 },
        { clientX: 15, clientY: 150 }
      ]),

      store.sAssertEq('Should still be empty because two valid events are required to start pinching ', [ ]),

      sSendTouchmove([
        { clientX: 10, clientY: 100 },
        { clientX: 15, clientY: 150 }
      ]),

      store.sAssertEq('Values should be 0, 0 because the delta is zero', [
        { method: 'pinch', dx: 0, dy: 0 }
      ]),
      store.sClear,

      sSendTouchmove([
        { clientX: 5, clientY: 50 },
        { clientX: 20, clientY: 200 }
      ]),

      store.sAssertEq('Should have increased in size (delta of differences)', [
        { method: 'punch', dx: (20 - 5) - (15 - 10), dy: (200 - 50) - (150 - 100) }
      ]),
      store.sClear,

      sSendTouchmove([
        { clientX: 8, clientY: 80 },
        { clientX: 16, clientY: 160 }
      ]),

      store.sAssertEq('Should have decreased in size (delta of differences)', [
        { method: 'pinch', dx: (16 - 8) - (20 - 5), dy: (160 - 80) - (200 - 50) }
      ])
    ];
  }, function () { success(); }, failure);
});

