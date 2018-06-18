import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SliderModel from './SliderModel';
import { SliderDetail } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SimulatedEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SugarPosition, SugarEvent } from '../../alien/TypeDefinitions';

import { Position } from '@ephox/sugar';

const _changeEvent = 'slider.change.value';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

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

const getEventX = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const spot = getEventSource(simulatedEvent);
  return spot.map((s) => {
    return s.left();
  });
};

const fireChange = (component: AlloyComponent, value: number): void => {
  AlloyTriggers.emitWith(component, _changeEvent, { value });
};

const moveRightFromLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireChange(ledge, detail.min());
};

const moveLeftFromRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireChange(redge, detail.max());
};

const setToRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireChange(redge, detail.max() + 1);
};

const setToLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireChange(ledge, detail.min() - 1);
};

const setToX = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, xValue: number): void => {
  const value = SliderModel.findValueOfX(
    spectrumBounds, detail.min(), detail.max(),
    xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireChange(spectrum, value);
};

const setXFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventX(simulatedEvent).map((xValue) => {
    setToX(spectrum, spectrumBounds, detail, xValue);
    return xValue;
  });
};

const moveLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireChange(spectrum, newValue);
};

const moveRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = SliderModel.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireChange(spectrum, newValue);
};

const changeEvent = () => _changeEvent;

export {
  setXFromEvent,
  setToLedge,
  setToRedge,
  moveLeftFromRedge,
  moveRightFromLedge,
  moveLeft,
  moveRight,
  changeEvent
};