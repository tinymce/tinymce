import { Fun, Option } from '@ephox/katamari';
import { Css, Height } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';

import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SliderValueY, VerticalSliderDetail } from '../types/SliderTypes';
import * as EdgeActions from './EdgeActions';
import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import { getMaxYBounds, getMinYBounds, getYCenterOffSetOf, getYScreenRange } from './SliderOffsets';
import { currentValue, hasBEdge, hasTEdge, maxY, minY, rounded, snap, snapStart, step, yRange } from './SliderValues';

// fire slider change event with y value
const fireSliderChange = (spectrum: AlloyComponent, value: SliderValueY): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (y: number): SliderValueY => ({
  y: Fun.constant(y)
});

// find the value of the y offset of where the mouse was clicked from the model.
const findValueOfOffset = (spectrum: AlloyComponent, detail: VerticalSliderDetail, top: number): number => {
  const args = {
    min: minY(detail),
    max: maxY(detail),
    range: yRange(detail),
    value: top,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasTEdge(detail),
    hasMaxEdge: hasBEdge(detail),
    minBound: getMinYBounds(spectrum),
    maxBound: getMaxYBounds(spectrum),
    screenRange: getYScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

// find the value and fire a slider change event, returning the value
const setValueFrom = (spectrum: AlloyComponent, detail: VerticalSliderDetail, value: number): number => {
  const yValue = findValueOfOffset(spectrum, detail, value);
  const sliderVal = sliderValue(yValue);
  fireSliderChange(spectrum, sliderVal);
  return yValue;
};

// fire a slider change event with the minimum value
const setToMin = (spectrum: AlloyComponent, detail: VerticalSliderDetail): void => {
  const min = minY(detail);
  fireSliderChange(spectrum, sliderValue(min));
};

// fire a slider change event with the maximum value
const setToMax = (spectrum: AlloyComponent, detail: VerticalSliderDetail): void => {
  const max = maxY(detail);
  fireSliderChange(spectrum, sliderValue(max));
};

// move in a direction by step size. Fire change at the end
const moveBy = (direction: number, spectrum: AlloyComponent, detail: VerticalSliderDetail): Option<number> => {
  const f = (direction > 0) ? SliderModel.increaseBy : SliderModel.reduceBy;
  const yValue = f(currentValue(detail).y(), minY(detail), maxY(detail), step(detail));
  fireSliderChange(spectrum, sliderValue(yValue));
  return Option.some(yValue);
};

const handleMovement = (direction: number) => (spectrum: AlloyComponent, detail: VerticalSliderDetail): Option<boolean> => moveBy(direction, spectrum, detail).map((): boolean => true);

// get y offset from event
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const pos = ModelCommon.getEventSource(simulatedEvent);
  return pos.map(function (p) {
    return p.top();
  });
};

// find the y offset of a given value from the model
const findOffsetOfValue = (spectrum: AlloyComponent, detail: VerticalSliderDetail, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
  const minOffset = 0;
  const maxOffset = getYScreenRange(spectrum);
  const centerMinEdge = minEdge.bind((edge: AlloyComponent) =>
    Option.some(getYCenterOffSetOf(edge, spectrum))).getOr(minOffset);
  const centerMaxEdge = maxEdge.bind((edge: AlloyComponent) =>
    Option.some(getYCenterOffSetOf(edge, spectrum))).getOr(maxOffset);

  const args = {
    min: minY(detail),
    max: maxY(detail),
    range: yRange(detail),
    value,
    hasMinEdge: hasTEdge(detail),
    hasMaxEdge: hasBEdge(detail),
    minBound: getMinYBounds(spectrum),
    minOffset,
    maxBound: getMaxYBounds(spectrum),
    maxOffset,
    centerMinEdge,
    centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

// find left offset for absolute positioning from a given value
const findPositionOfValue = (slider: AlloyComponent, spectrum: AlloyComponent, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: VerticalSliderDetail): number => {
  const offset = findOffsetOfValue(spectrum, detail, value, minEdge, maxEdge);
  return (getMinYBounds(spectrum) - getMinYBounds(slider)) + offset;
};

// update the position of the thumb from the slider's current value
const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: VerticalSliderDetail, edges: any): void => {
  const value = currentValue(detail);
  const pos = findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.y(),
    edges.getTopEdge(slider),
    edges.getBottomEdge(slider),
    detail
  );
  const thumbRadius = Height.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'top', (pos - thumbRadius) + 'px');
};

// Key Events
const onLeft = Option.none;
const onRight = Option.none;
const onUp = handleMovement(-1);
const onDown = handleMovement(1);

// Edge Click Actions
const edgeActions = {
  'top-left': Option.none(),
  'top': Option.some(EdgeActions.setToTEdge),
  'top-right': Option.none(),
  'right': Option.none(),
  'bottom-right': Option.none(),
  'bottom': Option.some(EdgeActions.setToBEdge),
  'bottom-left': Option.none(),
  'left': Option.none()
};

export {
  setValueFrom,
  setToMin,
  setToMax,
  findValueOfOffset,
  getValueFromEvent,
  findPositionOfValue,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
};
