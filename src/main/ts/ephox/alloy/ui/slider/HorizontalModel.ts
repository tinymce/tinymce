import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderDetail } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option, Fun } from '@ephox/katamari';
import { Css, Width } from '@ephox/sugar';
import * as EdgeActions from './EdgeActions';

import { minX, maxX, currentValue, step, snap, snapStart, xRange, rounded, hasLedge, hasRedge } from './SliderValues';
import { getMinXBounds, getMaxXBounds, getXScreenRange, getXCenterOffSetOf } from './SliderOffsets';

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
  const newValue = f(currentValue(detail), minX(detail), maxX(detail), step(detail));
  return Option.some(setValueTo(spectrum, detail, newValue));
};

const findValueOfOffset = (spectrum, detail, left) => {
  const args = {
    min: minX(detail),
    max: maxX(detail),
    range: xRange(detail),
    value: left,
    step: step(detail),
    snap: snap(detail),
    snapStart: snapStart(detail),
    rounded: rounded(detail),
    hasMinEdge: hasLedge(detail),
    hasMaxEdge: hasRedge(detail),
    minBound: getMinXBounds(spectrum),
    maxBound: getMaxXBounds(spectrum),
    screenRange: getXScreenRange(spectrum)
  };
  return SliderModel.findValueOf(args);
};

// get event data
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent) => {
  const pos = ModelCommon.getEventSource(simulatedEvent);
  return pos.map(function (p) {
    return p.left();
  });
};

const findOffsetOfValue = (spectrum: AlloyComponent, detail: SliderDetail, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>): number => {
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
    hasMinEdge: hasLedge(detail),
    hasMaxEdge: hasRedge(detail),
    minBound: getMinXBounds(spectrum),
    minOffset,
    maxBound: getMaxXBounds(spectrum),
    maxOffset,
    centerMinEdge: centerMinEdge,
    centerMaxEdge: centerMaxEdge
  };
  return SliderModel.findOffsetOfValue(args);
};

// Model Value -> View position
const findPositionOfValue = (slider: AlloyComponent, spectrum: AlloyComponent, value: number, minEdge: Option<AlloyComponent>, maxEdge: Option<AlloyComponent>, detail: SliderDetail) => {
  const offset = findOffsetOfValue(spectrum, detail, value, minEdge, maxEdge);
  return (getMinXBounds(spectrum) - getMinXBounds(slider)) + offset;
};

const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, edges: any) => {
  const value = currentValue(detail);
  const pos = findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value,
    edges.getLeftEdge(slider),
    edges.getRightEdge(slider),
    detail
  );
  const thumbRadius = Width.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'left', (pos - thumbRadius) + 'px');
};

const onLeft = moveBy(-1);
const onRight = moveBy(1);
const onUp = Option.none;
const onDown = Option.none;

const edgeActions = Fun.constant({
  'top-left': Fun.noop,
  'top': EdgeActions.setToTedge, // This is deliberate
  'top-right': Fun.noop,
  'right': EdgeActions.setToRedge,
  'bottom-right': Fun.noop,
  'bottom': EdgeActions.setToBedge, // This is too
  'bottom-left': Fun.noop,
  'left': EdgeActions.setToLedge
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