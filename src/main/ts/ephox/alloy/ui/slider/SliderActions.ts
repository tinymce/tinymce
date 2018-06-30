import { ClientRect, MouseEvent, Touch, TouchEvent, XMLDocument } from '@ephox/dom-globals';
import { Option, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Position } from '@ephox/sugar';

import { SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SliderValue, SliderDetail } from '../../ui/types/SliderTypes';
import * as SliderModel from './SliderModel';

import { minX, maxX, minY, maxY, currentX, currentY, findX, findY } from './SliderValues';
import * as SliderPosition from './SliderPositions';

const _sliderChangeEvent = 'slider.change.value';

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
  return spot.map(function (s) {
    return s.left();
  });
};

const getEventY = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.top();
  });
};

const fireSliderChange = (component: AlloyComponent, value: SliderValue): void => {
  AlloyTriggers.emitWith(component, _sliderChangeEvent, { value });
};

// North West
const setToTLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.topLeft(detail));
};

// North
const setToTedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.top(detail));
};

//North East
const setToTRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.topRight(detail));
};

// East
const setToRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.right(detail));
};

// South East
const setToBRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottomRight(detail));
};

// South
const setToBedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottom(detail));
};

// South West
const setToBLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottomLeft(detail));
};

// West
const setToLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.left(detail));
};

const setToX = (spectrum: AlloyComponent, detail: SliderDetail, xValue: number): void => {
  const val = SliderPosition.sliderValue(findX(spectrum, detail, xValue), currentY(detail));
  fireSliderChange(spectrum, val);
};

const setToY = (spectrum: AlloyComponent, detail: SliderDetail, yValue: number): void => {
  const val = SliderPosition.sliderValue(currentX(detail), findY(spectrum, detail, yValue));
  fireSliderChange(spectrum, val);
};

const setToCoords = (spectrum: AlloyComponent, detail: SliderDetail, coords: SugarPosition): void => {
  const x = findX(spectrum, detail, coords.left());
  const y = findY(spectrum, detail, coords.top());
  const val = SliderPosition.sliderValue(x, y);

  fireSliderChange(spectrum, val);
};

const setXFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventX(simulatedEvent).map(function (xValue) {
    setToX(spectrum, detail, xValue);
    return xValue;
  });
};

const setYFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventY(simulatedEvent).map(function (yValue) {
    setToY(spectrum, detail, yValue);
    return yValue;
  });
};

const setCoordsFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  return getEventSource(simulatedEvent).map(function (coords) {
    setToCoords(spectrum, detail, coords);
    return coords;
  });
};

const moveRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newX = SliderModel.increaseBy(currentX(detail), minX(detail), maxX(detail), detail.stepSize());
  const val = SliderPosition.sliderValue(newX, currentY(detail));
  fireSliderChange(spectrum, val);
};

const moveLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newX = SliderModel.reduceBy(currentX(detail), minX(detail), maxX(detail), detail.stepSize());
  const val = SliderPosition.sliderValue(newX, currentY(detail));
  fireSliderChange(spectrum, val);
};

const moveDown = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newY = SliderModel.increaseBy(currentY(detail), minY(detail), maxY(detail), detail.stepSize());
  const val = SliderPosition.sliderValue(currentX(detail), newY);
  fireSliderChange(spectrum, val);
};

const moveUp = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newY = SliderModel.reduceBy(detail.value().get().y(), minY(detail), maxY(detail), detail.stepSize());
  const val = SliderPosition.sliderValue(currentX(detail), newY);
  fireSliderChange(spectrum, val);
};

const sliderChangeEvent = Fun.constant(_sliderChangeEvent);

export {
  setXFromEvent,
  setYFromEvent,
  setCoordsFromEvent,
  setToLedge,
  setToRedge,
  setToTedge,
  setToBedge,
  setToTLedge,
  setToTRedge,
  setToBLedge,
  setToBRedge,
  moveRight,
  moveLeft,
  moveDown,
  moveUp,
  sliderChangeEvent
};