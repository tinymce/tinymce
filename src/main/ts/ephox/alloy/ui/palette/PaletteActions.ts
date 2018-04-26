import { Fun, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as PaletteModel from './PaletteModel';

const _changeEvent = 'palette.change.value';

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

const getEventCoords = function (simulatedEvent) {
  const spot = getEventSource(simulatedEvent);
  return spot.map(function (s) {
    return {x: s.clientX, y: s.clientY};
  });
};

const fireChange = function (component, value) {
  AlloyTriggers.emitWith(component, _changeEvent, { value });
};

const setToCoords = function (spectrum, spectrumBounds, detail, coords) {
  const value = PaletteModel.findValueOfCoords(
    spectrumBounds, 0, 100,
    coords, 1
  );

  fireChange(spectrum, value);
};

const setCoordsFromEvent = function (spectrum, detail, spectrumBounds, simulatedEvent) {
  return getEventCoords(simulatedEvent).map(function (coords) {
    setToCoords(spectrum, spectrumBounds, detail, coords);
    return coords;
  });
};

const moveLeft = function (spectrum, detail) {
  const newValue = PaletteModel.reduceBy(detail.value().get(), 0, 100, 1);
  fireChange(spectrum, newValue);
};

const moveRight = function (spectrum, detail) {
  const newValue = PaletteModel.increaseBy(detail.value().get(), 0, 100, 1);
  fireChange(spectrum, newValue);
};

const changeEvent = Fun.constant(_changeEvent);

export {
  setCoordsFromEvent,
  moveLeft,
  moveRight,
  changeEvent
};