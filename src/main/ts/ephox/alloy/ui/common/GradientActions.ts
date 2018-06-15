import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as GradientModel from './GradientModel';

const _sliderChangeEvent = 'slider.change.value';
const _paletteChangeEvent = 'palette.change.value';

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

const fireSliderChange = function (component, value) {
  AlloyTriggers.emitWith(component, _sliderChangeEvent, { value });
};

const firePaletteChange = function (component, value) {
  AlloyTriggers.emitWith(component, _paletteChangeEvent, { value });
};

const moveRightFromLedge = function (ledge, detail) {
  fireSliderChange(ledge, detail.min());
};

const moveLeftFromRedge = function (redge, detail) {
  fireSliderChange(redge, detail.max());
};

const setToRedge = function (redge, detail) {
  fireSliderChange(redge, detail.max() + 1);
};

const setToLedge = function (ledge, detail) {
  fireSliderChange(ledge, detail.min() - 1);
};

const setToX = function (spectrum, spectrumBounds, detail, xValue) {
  const value = GradientModel.findValueOfX(
    spectrumBounds, detail.min(), detail.max(),
    xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireSliderChange(spectrum, value);
};

const setToY = function (spectrum, spectrumBounds, detail, yValue) {
  const value = GradientModel.findValueOfY(
    spectrumBounds, detail.min(), detail.max(),
    yValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireSliderChange(spectrum, value);
};

const setToCoords = function (spectrum, spectrumBounds, detail, coords) {
  const value = GradientModel.findPercentageValueOfCoords(spectrumBounds, coords);

  firePaletteChange(spectrum, value);
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
  fireSliderChange(spectrum, newValue);
};

const moveRight = function (spectrum, detail) {
  const newValue = GradientModel.increaseBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireSliderChange(spectrum, newValue);
};

const sliderChangeEvent = Fun.constant(_sliderChangeEvent);
const paletteChangeEvent = Fun.constant(_paletteChangeEvent);

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
  sliderChangeEvent,
  paletteChangeEvent
};