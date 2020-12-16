import { Optional } from '@ephox/katamari';
import { EventArgs } from '@ephox/sugar';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { DragModeDeltas } from '../../dragging/common/DraggingTypes';
import { PinchDragData, PinchingConfig, PinchingState } from './PinchingTypes';

const mode: DragModeDeltas<TouchEvent, PinchDragData> = {
  getData: (e: EventArgs<TouchEvent>) => {
    const raw = e.raw;
    const touches = raw.touches;
    if (touches.length < 2) {
      return Optional.none();
    }

    const deltaX = Math.abs(touches[0].clientX - touches[1].clientX);
    const deltaY = Math.abs(touches[0].clientY - touches[1].clientY);

    const deltaDistance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    return Optional.some({
      deltaX,
      deltaY,
      deltaDistance
    });
  },

  getDelta: (old, nu) => {
    const changeX = nu.deltaX - old.deltaX;
    const changeY = nu.deltaY - old.deltaY;
    const changeDistance = nu.deltaDistance - old.deltaDistance;

    return {
      deltaX: changeX,
      deltaY: changeY,
      deltaDistance: changeDistance
    };
  }
};

const events = (pinchConfig: PinchingConfig, pinchState: PinchingState): AlloyEvents.AlloyEventRecord => AlloyEvents.derive([
  // TODO: Only run on iOS. It prevents default behaviour like zooming and showing all the tabs.
  // Note: in testing, it didn't seem to cause problems on Android. Check.
  AlloyEvents.preventDefault(NativeEvents.gesturestart()),

  AlloyEvents.run<EventArgs<TouchEvent>>(NativeEvents.touchmove(), (component, simulatedEvent) => {
    simulatedEvent.stop();

    const delta = pinchState.update(mode, simulatedEvent.event);
    delta.each((dlt) => {
      const multiplier = dlt.deltaDistance > 0 ? 1 : -1;
      const changeX = multiplier * Math.abs(dlt.deltaX);
      const changeY = multiplier * Math.abs(dlt.deltaY);

      const f = multiplier === 1 ? pinchConfig.onPunch : pinchConfig.onPinch;
      f(component.element, changeX, changeY);
    });
  }),

  AlloyEvents.run(NativeEvents.touchend(), pinchState.reset)
]);

export {
  events
};
