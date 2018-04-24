import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as SliderModel from './PaletteModel';

const _changeEvent = 'slider.change.value';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const getEventSource = function (simulatedEvent, posProp) {
  const evt = simulatedEvent.event().raw();
  if (isTouch && evt.touches !== undefined && evt.touches.length === 1) {
    return Option.some(evt.touches[0]);
  } else if (isTouch && evt.touches !== undefined) {
      return Option.none();
  } else if (!isTouch && evt[posProp] !== undefined) {
      return Option.some(evt);
  } else {
      return Option.none();
  }
};

const getXEventSource = function (simulatedEvent) {
  return getEventSource(simulatedEvent, 'clientX')
};

const getYEventSource = function (simulatedEvent) {
  return getEventSource(simulatedEvent, 'clientY')
};

const getEventX = function (simulatedEvent) {
  const spot = getXEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.clientX;
  });
};

const getEventY = function (simulatedEvent) {
  const spot = getYEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.clientY;
  });
};

const fireChange = function (component, value) {
  AlloyTriggers.emitWith(component, _changeEvent, { value });
};

const moveRightFromLedge = function (ledge, detail) {
  fireChange(ledge, 0);
};

const moveLeftFromRedge = function (redge, detail) {
  fireChange(redge, 100);
};

const setToRedge = function (redge, detail) {
  fireChange(redge, 100 + 1);
};

const setToLedge = function (ledge, detail) {
  fireChange(ledge, 0 - 1);
};

const setToX = function (spectrum, spectrumBounds, detail, xValue) {
  const value = SliderModel.findValueOfX(
    spectrumBounds, 0, 100,
    xValue, 1
  );

  fireChange(spectrum, value);
};

const setToY = function (spectrum, spectrumBounds, detail, yValue) {
  const value = SliderModel.findValueOfY(
    spectrumBounds, 0, 100,
    yValue, 1
  );

  fireChange(spectrum, value);
};

const setXFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
  return getEventX(simulatedEvent).map(function (xValue) {
    setToX(spectrum, spectrumBounds, detail, xValue);
    return xValue;
  });
};

const setYFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
  return getEventY(simulatedEvent).map(function (yValue) {
    setToY(spectrum, spectrumBounds, detail, yValue);
    return yValue;
  });
};

const moveLeft = function (spectrum, detail) {
  const newValue = SliderModel.reduceBy(detail.value().get(), 0, 100, 1);
  fireChange(spectrum, newValue);
};

const moveRight = function (spectrum, detail) {
  const newValue = SliderModel.increaseBy(detail.value().get(), 0, 100, 1);
  fireChange(spectrum, newValue);
};

const changeEvent = Fun.constant(_changeEvent);

export {
  setXFromEvent,
  setYFromEvent,
  setToLedge,
  setToRedge,
  moveLeftFromRedge,
  moveRightFromLedge,
  moveLeft,
  moveRight,
  changeEvent
};