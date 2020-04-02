import { Fun } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderValue, TwoDSliderDetail } from '../types/SliderTypes';

import * as ModelCommon from './ModelCommon';
import { halfX, halfY, max1X, max1Y, min1X, min1Y } from './SliderValues';

const xValue = (x: number) => ({
  x: Fun.constant(x)
});

const yValue = (y: number) => ({
  y: Fun.constant(y)
});

const xyValue = (x: number, y: number) => ({
  x: Fun.constant(x),
  y: Fun.constant(y)
});

const fireSliderChange = (component: AlloyComponent, value: SliderValue): void => {
  AlloyTriggers.emitWith(component, ModelCommon.sliderChangeEvent(), { value });
};

// North West XY
const setToTLEdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), min1Y(detail)));
};

// North
const setToTEdge = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, yValue(min1Y(detail)));
};

// North XY
const setToTEdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(halfX(detail), min1Y(detail)));
};

// North East XY
const setToTREdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), min1Y(detail)));
};

// East
const setToREdge = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xValue(max1X(detail)));
};

// East XY
const setToREdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), halfY(detail)));
};

// South East XY
const setToBREdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(max1X(detail), max1Y(detail)));
};

// South
const setToBEdge = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, yValue(max1Y(detail)));
};

// South XY
const setToBEdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(halfX(detail), max1Y(detail)));
};

// South West XY
const setToBLEdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), max1Y(detail)));
};

// West
const setToLEdge = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xValue(min1X(detail)));
};

// West XY
const setToLEdgeXY = (edge: AlloyComponent, detail: TwoDSliderDetail): void => {
  fireSliderChange(edge, xyValue(min1X(detail), halfY(detail)));
};

export {
  setToTLEdgeXY,
  setToTEdge,
  setToTEdgeXY,
  setToTREdgeXY,
  setToREdge,
  setToREdgeXY,
  setToBREdgeXY,
  setToBEdge,
  setToBEdgeXY,
  setToBLEdgeXY,
  setToLEdge,
  setToLEdgeXY
};
