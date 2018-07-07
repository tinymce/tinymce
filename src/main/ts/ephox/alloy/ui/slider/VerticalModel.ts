import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderDetail } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option, Fun } from '@ephox/katamari';
import { Css, Height } from '@ephox/sugar';

import { minY, maxY, currentValue, step, snap, snapStart, yRange, rounded, hasTedge, hasBedge } from './SliderValues';
import { getMinYBounds, getMaxYBounds, getYScreenRange, getYCenterOffSetOf } from './SliderOffsets';
import * as EdgeActions from './EdgeActions';

const fireSliderChange = (spectrum: AlloyComponent, value: number): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

// Which does a SET. Fire change at the end
const setValueTo = (spectrum, detail, value) => {
  const xValue = findValueOfOffset(spectrum, detail, value);
  fireSliderChange(spectrum, xValue);
  return xValue;
};

// Which does a delta (step size). Fire change at the end
const moveBy = (direction) => (spectrum, detail) => {
  const f = (direction > 0) ? SliderModel.increaseBy : SliderModel.reduceBy;
  const newValue = f(currentValue(detail), minY(detail), maxY(detail), step(detail));
  return Option.some(setValueTo(spectrum, detail, newValue));
};

const findValueOfOffset = (spectrum, detail, top) => {
  const args = {
    min: minY(detail),
    max: maxY(detail),
    range: yRange(detail),
    value: top,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasTedge(detail),
    hasMaxEdge: hasBedge(detail),
    minBound: getMinYBounds(spectrum),
    maxBound: getMaxYBounds(spectrum),
    screenRange: getYScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

// get event data
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent) => {
  const pos = ModelCommon.getEventSource(simulatedEvent);
  return pos.map(function (p) {
    return p.top();
  });
};

const findOffsetOfValue = (spectrum: AlloyComponent, detail: SliderDetail, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
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
    hasMinEdge: hasTedge(detail),
    hasMaxEdge: hasBedge(detail),
    minBound: getMinYBounds(spectrum),
    minOffset,
    maxBound: getMaxYBounds(spectrum),
    maxOffset,
    centerMinEdge: centerMinEdge,
    centerMaxEdge: centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

// Model Value -> View position
const findPositionOfValue = (slider: AlloyComponent, spectrum: AlloyComponent, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: SliderDetail) => {
  const offset = findOffsetOfValue(spectrum, detail, value, minEdge, maxEdge);
  return (getMinYBounds(spectrum) - getMinYBounds(slider)) + offset;
};

const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, edges: any) => {
  const value = currentValue(detail);
  const pos = findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value,
    edges.getTopEdge(slider),
    edges.getBottomEdge(slider),
    detail
  );
  const thumbRadius = Height.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'top', (pos - thumbRadius) + 'px');
};

const onLeft = Option.none;
const onRight = Option.none;
const onUp = moveBy(-1);
const onDown = moveBy(1);

const edgeActions = Fun.constant({
  'top-left': Fun.noop,
  'top': EdgeActions.setToTedge,
  'top-right': Fun.noop,
  'right': EdgeActions.setToRedge, // This is deliberate
  'bottom-right': Fun.noop,
  'bottom': EdgeActions.setToBedge,
  'bottom-left': Fun.noop,
  'left': EdgeActions.setToLedge // This is too
});

export {
  setValueTo,
  findValueOfOffset,
  getValueFromEvent,
  findPositionOfValue,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
}