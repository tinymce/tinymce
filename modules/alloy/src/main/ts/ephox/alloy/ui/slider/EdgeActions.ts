import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderValue, SliderValueXY, TwoDSliderDetail } from '../types/SliderTypes';
import * as ModelCommon from './ModelCommon';
import { halfX, halfY, max1X, max1Y, min1X, min1Y } from './SliderValues';

const xyValue = (x: number, y: number): SliderValueXY => ({
  x,
  y
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
  fireSliderChange(edge, min1Y(detail));
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
  fireSliderChange(edge, max1X(detail));
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
  fireSliderChange(edge, max1Y(detail));
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
  fireSliderChange(edge, min1X(detail));
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
