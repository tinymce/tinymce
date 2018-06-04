import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as GradientModel from './GradientModel';

const _changeEvent = 'slider.change.value';

const isTouch = PlatformDetection.detect().deviceType.isTouch();

const getEventSource = function (simulatedEvent) {
  const evt = simulatedEvent.event().raw();
  if (isTouch && evt.touches !== undefined && evt.touches.length === 1) {
    return Option.some(evt.touches[0]);
  } else if (isTouch && evt.touches !== undefined) {
      return Option.none();
  } else if (!isTouch && evt.clientX !== undefined && evt.clientY !== undefined) {
      return Option.some(evt);
  } else {
      return Option.none();
  }
};

const getEventX = function (simulatedEvent) {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.clientX;
  });
};

const getEventY = function (simulatedEvent) {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return s.clientY;
  });
};

const getEventCoords = function (simulatedEvent) {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return {
      x: s.clientX, 
      y: s.clientY
    };
  });
};

const fireChange = function (component, value) {
  AlloyTriggers.emitWith(component, _changeEvent, { value });
};

const moveRightFromLedge = function (ledge, detail) {
  fireChange(ledge, detail.min());
};

const moveLeftFromRedge = function (redge, detail) {
  fireChange(redge, detail.max());
};

const setToRedge = function (redge, detail) {
  fireChange(redge, detail.max() + 1);
};

const setToLedge = function (ledge, detail) {
  fireChange(ledge, detail.min() - 1);
};

const setToX = function (spectrum, spectrumBounds, detail, xValue) {
  const value = GradientModel.findValueOfX(
    spectrumBounds, detail.min(), detail.max(),
    xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireChange(spectrum, value);
};

const setToY = function (spectrum, spectrumBounds, detail, yValue) {
  const value = GradientModel.findValueOfY(
    spectrumBounds, detail.min(), detail.max(),
    yValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireChange(spectrum, value);
};

const setToCoords = function (spectrum, spectrumBounds, detail, coords) {
  const value = GradientModel.findValueOfCoords(
    spectrumBounds, detail.minX(), detail.minY(), detail.maxX(), detail.maxY(),
    coords, 1, false, 0
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

const setCoordsFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
  return getEventCoords(simulatedEvent).map(function (coords) {
    setToCoords(spectrum, spectrumBounds, detail, coords);
    return coords;
  });
};

const moveLeft = function (spectrum, detail) {
  const newValue = GradientModel.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireChange(spectrum, newValue);
};

const moveRight = function (spectrum, detail) {
  const newValue = GradientModel.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireChange(spectrum, newValue);
};

const changeEvent = Fun.constant(_changeEvent);

export {
  setXFromEvent,
  setYFromEvent,
  setCoordsFromEvent,
  setToLedge,
  setToRedge,
  moveLeftFromRedge,
  moveRightFromLedge,
  moveLeft,
  moveRight,
  changeEvent
};