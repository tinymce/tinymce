import { Fun } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderValue, SliderDetail } from '../../ui/types/SliderTypes';

import * as ModelCommon from './ModelCommon';
import { min1X, max1X, min1Y, max1Y, halfX, halfY } from './SliderValues';

const xValue = (x: number) => {
  return {
    x: Fun.constant(x)
  }
};

const yValue = (y: number) => {
  return {
    y: Fun.constant(y)
  }
};

const xyValue = (x: number, y: number) => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  }
};

const fireSliderChange = (component: AlloyComponent, value: SliderValue): void => {
  AlloyTriggers.emitWith(component, ModelCommon.sliderChangeEvent(), { value });
};

// North West XY
const setToTLedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), min1Y(detail)));
};

// North
const setToTedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, yValue(min1Y(detail)));
};

// North XY
const setToTedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(halfX(detail), min1Y(detail)));
};

// North East XY
const setToTRedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), min1Y(detail)));
};

// East
const setToRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xValue(max1X(detail)));
};

// East XY
const setToRedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), halfY(detail)));
};

// South East XY
const setToBRedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), max1Y(detail)));
};

// South
const setToBedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, yValue(max1Y(detail)));
};

// South XY
const setToBedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(halfX(detail), max1Y(detail)));
};

// South West XY
const setToBLedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), max1Y(detail)));
};

// West
const setToLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xValue(min1X(detail)));
};

// West XY
const setToLedgeXY = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), halfY(detail)));
};

export {
  setToTLedgeXY,
  setToTedge,
  setToTedgeXY,
  setToTRedgeXY,
  setToRedge,
  setToRedgeXY,
  setToBRedgeXY,
  setToBedge,
  setToBedgeXY,
  setToBLedgeXY,
  setToLedge,
  setToLedgeXY,
};