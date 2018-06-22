import { ClientRect, MouseEvent, Touch, TouchEvent } from '@ephox/dom-globals';
import { Option, Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Position } from '@ephox/sugar';

import { SugarPosition } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SliderDetail } from '../../ui/types/SliderTypes';
import * as GradientModel from './GradientModel';
import { PercentagePosition } from './GradientModel';

const _sliderChangeEvent = 'slider.change.value';
const _paletteChangeEvent = 'palette.change.value';

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

const fireSliderChange = (component: AlloyComponent, value: number): void => {
  AlloyTriggers.emitWith(component, _sliderChangeEvent, { value });
};

const firePaletteChange = (component: AlloyComponent, value: PercentagePosition): void => {
  AlloyTriggers.emitWith(component, _paletteChangeEvent, { value });
};

const moveRightFromLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, detail.min());
};

const moveLeftFromRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, detail.max());
};

const setToRedge = (redge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(redge, detail.max() + 1);
};

const setToLedge = (ledge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(ledge, detail.min() - 1);
};

const setToX = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, xValue: number): void => {
  const value = GradientModel.findValueOfX(
    spectrumBounds, detail.min(), detail.max(),
    xValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireSliderChange(spectrum, value);
};

const setToY = (spectrum: AlloyComponent, spectrumBounds: ClientRect, detail: SliderDetail, yValue: number): void => {
  const value = GradientModel.findValueOfY(
    spectrumBounds, detail.min(), detail.max(),
    yValue, detail.stepSize(), detail.snapToGrid(), detail.snapStart()
  );

  fireSliderChange(spectrum, value);
};

const setToCoords = (palette: AlloyComponent, paletteBounds: ClientRect, coords: SugarPosition): void => {
  const value = GradientModel.findPercentageValueOfCoords(paletteBounds, coords);

  firePaletteChange(palette, value);
};

const setXFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventX(simulatedEvent).map(function (xValue) {
    setToX(spectrum, spectrumBounds, detail, xValue);
    return xValue;
  });
};

const setYFromEvent = (spectrum: AlloyComponent, detail: SliderDetail, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<number> => {
  return getEventY(simulatedEvent).map(function (yValue) {
    setToY(spectrum, spectrumBounds, detail, yValue);
    return yValue;
  });
};

const setCoordsFromEvent = (spectrum: AlloyComponent, spectrumBounds: ClientRect, simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  return getEventSource(simulatedEvent).map(function (coords) {
    setToCoords(spectrum, spectrumBounds, coords);
    return coords;
  });
};

const moveLeft = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const newValue = GradientModel.reduceBy(detail.value().get(), detail.min(), detail.max(), detail.stepSize());
  fireSliderChange(spectrum, newValue);
};

const moveRight = (spectrum: AlloyComponent, detail: SliderDetail): void => {
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