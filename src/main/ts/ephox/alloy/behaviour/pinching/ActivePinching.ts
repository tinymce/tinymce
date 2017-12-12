import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var mode = {
  getData: function (e) {
    var touches = e.raw().touches;
    if (touches.length < 2) return Option.none();

    var deltaX = Math.abs(touches[0].clientX - touches[1].clientX);
    var deltaY = Math.abs(touches[0].clientY - touches[1].clientY);

    var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    return Option.some({
      deltaX: Fun.constant(deltaX),
      deltaY: Fun.constant(deltaY),
      deltaDistance: Fun.constant(distance)
    });
  },

  getDelta: function (old, nu) {
    var changeX = nu.deltaX() - old.deltaX();
    var changeY = nu.deltaY() - old.deltaY();
    var changeDistance = nu.deltaDistance() - old.deltaDistance();

    return {
      deltaX: Fun.constant(changeX),
      deltaY: Fun.constant(changeY),
      deltaDistance: Fun.constant(changeDistance)
    };
  }
};

var events = function (pinchConfig, pinchState) {
  return AlloyEvents.derive([
    // TODO: Only run on iOS. It prevents default behaviour like zooming and showing all the tabs.
    // Note: in testing, it didn't seem to cause problems on Android. Check.
    AlloyEvents.preventDefault(NativeEvents.gesturestart()),

    AlloyEvents.run(NativeEvents.touchmove(), function (component, simulatedEvent) {
      simulatedEvent.stop();

      var delta = pinchState.update(mode, simulatedEvent.event());
      delta.each(function (dlt) {
        var multiplier = dlt.deltaDistance() > 0 ? 1 : -1;
        var changeX = multiplier * Math.abs(dlt.deltaX());
        var changeY = multiplier * Math.abs(dlt.deltaY());

        var f = multiplier === 1 ? pinchConfig.onPunch() : pinchConfig.onPinch();
        f(component.element(), changeX, changeY);
      });
    }),

    AlloyEvents.run(NativeEvents.touchend(), pinchState.reset)
  ]);
};

export default <any> {
  events: events
};