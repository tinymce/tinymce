import { Fun, Option } from '@ephox/katamari';
import { TouchEvent } from '@ephox/dom-globals';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as NativeEvents from '../../api/events/NativeEvents';
import { PinchingConfig, PinchingState, PinchDragData } from '../../behaviour/pinching/PinchingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { DraggingState, DragModeDeltas } from '../../dragging/common/DraggingTypes';
import { SugarEvent } from '../../alien/TypeDefinitions';
import { SimulatedEvent, EventFormat } from '../../events/SimulatedEvent';

const mode: DragModeDeltas<PinchDragData> = {
  getData (e: SugarEvent)  {
    const raw = e.raw() as TouchEvent;
    const touches = raw.touches;
    if (touches.length < 2) { return Option.none(); }

    const deltaX = Math.abs(touches[0].clientX - touches[1].clientX);
    const deltaY = Math.abs(touches[0].clientY - touches[1].clientY);

    const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    return Option.some({
      deltaX: Fun.constant(deltaX),
      deltaY: Fun.constant(deltaY),
      deltaDistance: Fun.constant(distance)
    });
  },

  getDelta (old, nu) {
    const changeX = nu.deltaX() - old.deltaX();
    const changeY = nu.deltaY() - old.deltaY();
    const changeDistance = nu.deltaDistance() - old.deltaDistance();

    return {
      deltaX: Fun.constant(changeX),
      deltaY: Fun.constant(changeY),
      deltaDistance: Fun.constant(changeDistance)
    };
  }
};

const events = (pinchConfig: PinchingConfig, pinchState: PinchingState): AlloyEvents.AlloyEventRecord => {
  return AlloyEvents.derive([
    // TODO: Only run on iOS. It prevents default behaviour like zooming and showing all the tabs.
    // Note: in testing, it didn't seem to cause problems on Android. Check.
    AlloyEvents.preventDefault(NativeEvents.gesturestart()),

    AlloyEvents.run<SugarEvent>(NativeEvents.touchmove(), (component, simulatedEvent) => {
      simulatedEvent.stop();

      const delta = pinchState.update(mode, simulatedEvent.event());
      delta.each((dlt) => {
        const multiplier = dlt.deltaDistance() > 0 ? 1 : -1;
        const changeX = multiplier * Math.abs(dlt.deltaX());
        const changeY = multiplier * Math.abs(dlt.deltaY());

        const f = multiplier === 1 ? pinchConfig.onPunch : pinchConfig.onPinch;
        f(component.element(), changeX, changeY);
      });
    }),

    AlloyEvents.run(NativeEvents.touchend(), pinchState.reset)
  ]);
};

export {
  events
};