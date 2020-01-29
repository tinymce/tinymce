import { Fun, Option } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { HorizontalSliderDetail, SliderValueX } from '../types/SliderTypes';
import * as EdgeActions from './EdgeActions';
import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import { getMaxXBounds, getMinXBounds, getXCenterOffSetOf, getXScreenRange } from './SliderOffsets';

import { currentValue, hasLEdge, hasREdge, maxX, minX, rounded, snap, snapStart, step, xRange } from './SliderValues';

// fire slider change event with x value
const fireSliderChange = (spectrum: AlloyComponent, value: SliderValueX): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (x: number): SliderValueX => {
  return {
    x: Fun.constant(x)
  };
};

// find the value of the x offset of where the mouse was clicked from the model.
const findValueOfOffset = (spectrum: AlloyComponent, detail: HorizontalSliderDetail, left: number): number => {
  const args = {
    min: minX(detail),
    max: maxX(detail),
    range: xRange(detail),
    value: left,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasLEdge(detail),
    hasMaxEdge: hasREdge(detail),
    minBound: getMinXBounds(spectrum),
    maxBound: getMaxXBounds(spectrum),
    screenRange: getXScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

// find the value and fire a slider change event, returning the value
const setValueFrom = (spectrum: AlloyComponent, detail: HorizontalSliderDetail, value: number): number => {
  const xValue = findValueOfOffset(spectrum, detail, value);
  const sliderVal = sliderValue(xValue);
  fireSliderChange(spectrum, sliderVal);
  return xValue;
};

// fire a slider change event with the minimum value
const setToMin = (spectrum: AlloyComponent, detail: HorizontalSliderDetail): void => {
  const min = minX(detail);
  fireSliderChange(spectrum, sliderValue(min));
};

// fire a slider change event with the maximum value
const setToMax = (spectrum: AlloyComponent, detail: HorizontalSliderDetail): void => {
  const max = maxX(detail);
  fireSliderChange(spectrum, sliderValue(max));
};

// move in a direction by step size. Fire change at the end
const moveBy = (direction: number, spectrum: AlloyComponent, detail: HorizontalSliderDetail): Option<number> => {
  const f = (direction > 0) ? SliderModel.increaseBy : SliderModel.reduceBy;
  const xValue = f(currentValue(detail).x(), minX(detail), maxX(detail), step(detail));
  fireSliderChange(spectrum, sliderValue(xValue));
  return Option.some(xValue);
};

const handleMovement = (direction: number) => (spectrum: AlloyComponent, detail: HorizontalSliderDetail): Option<boolean> => {
  return moveBy(direction, spectrum, detail).map((): boolean => true);
};

// get x offset from event
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent): Option<number> => {
  const pos = ModelCommon.getEventSource(simulatedEvent);
  return pos.map(function (p) {
    return p.left();
  });
};

// find the x offset of a given value from the model
const findOffsetOfValue = (spectrum: AlloyComponent, detail: HorizontalSliderDetail, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
  const minOffset = 0;
  const maxOffset = getXScreenRange(spectrum);
  const centerMinEdge = minEdge.bind((edge: AlloyComponent) =>
    Option.some(getXCenterOffSetOf(edge, spectrum))).getOr(minOffset);
  const centerMaxEdge = maxEdge.bind((edge: AlloyComponent) =>
    Option.some(getXCenterOffSetOf(edge, spectrum))).getOr(maxOffset);

  const args = {
    min: minX(detail),
    max: maxX(detail),
    range: xRange(detail),
    value,
    hasMinEdge: hasLEdge(detail),
    hasMaxEdge: hasREdge(detail),
    minBound: getMinXBounds(spectrum),
    minOffset,
    maxBound: getMaxXBounds(spectrum),
    maxOffset,
    centerMinEdge,
    centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

// find left offset for absolute positioning from a given value
const findPositionOfValue = (slider: AlloyComponent, spectrum: AlloyComponent, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: HorizontalSliderDetail): number => {
  const offset = findOffsetOfValue(spectrum, detail, value, minEdge, maxEdge);
  return (getMinXBounds(spectrum) - getMinXBounds(slider)) + offset;
};

// update the position of the thumb from the slider's current value
const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: HorizontalSliderDetail, edges: any): void => {
  const value = currentValue(detail);
  const pos = findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.x(),
    edges.getLeftEdge(slider),
    edges.getRightEdge(slider),
    detail
  );
  const thumbRadius = Width.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
};

// Key Events
const onLeft = handleMovement(-1);
const onRight = handleMovement(1);
const onUp = Option.none;
const onDown = Option.none;

// Edge Click Actions
const edgeActions = {
  'top-left': Option.none(),
  'top': Option.none(),
  'top-right': Option.none(),
  'right': Option.some(EdgeActions.setToREdge),
  'bottom-right': Option.none(),
  'bottom': Option.none(),
  'bottom-left': Option.none(),
  'left': Option.some(EdgeActions.setToLEdge)
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
