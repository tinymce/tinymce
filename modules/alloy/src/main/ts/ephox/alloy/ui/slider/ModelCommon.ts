import { TouchEvent, MouseEvent, Touch } from '@ephox/dom-globals';
import { Option, Fun } from '@ephox/katamari';
import { Position } from '@ephox/sugar';
import { PlatformDetection } from '@ephox/sand';

import { SugarPosition } from '../../alien/TypeDefinitions';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const _sliderChangeEvent = 'slider.change.value';
const sliderChangeEvent = Fun.constant(_sliderChangeEvent);

const getEventSource = (simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  const evt = simulatedEvent.event().raw();
  if (isTouch) {
    const touchEvent = evt as TouchEvent;
    return touchEvent.touches !== undefined && touchEvent.touches.length === 1 ?
      Option.some(touchEvent.touches[0]).map((t: Touch) => {
        return Position(t.clientX, t.clientY) as SugarPosition;
      }) : Option.none();
  } else {
    const mouseEvent = evt as MouseEvent;
    return mouseEvent.clientX !== undefined ? Option.some(mouseEvent).map((me) => {
      return Position(me.clientX, me.clientY) as SugarPosition;
    }) : Option.none();
  }
};

export {
  sliderChangeEvent,
  getEventSource
};
