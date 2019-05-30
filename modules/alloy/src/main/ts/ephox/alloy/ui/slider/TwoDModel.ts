import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderDetail, SliderValueXY, SliderModelDetailParts } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Fun, Option } from '@ephox/katamari';
import { Css, Width, Height } from '@ephox/sugar';

import * as HorizontalModel from './HorizontalModel';
import * as VerticalModel from './VerticalModel';
import { maxX, maxY, minX, minY, currentValue, step } from './SliderValues';
import * as EdgeActions from './EdgeActions';
import { SugarPosition } from '../../alien/TypeDefinitions';

// fire slider change event with xy value
const fireSliderChange = (spectrum: AlloyComponent, value: SliderValueXY): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (x: number, y: number): SliderValueXY => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  };
};

// find both values of x and y offsets of where the mouse was clicked from the model.
// then fire a slider change event with those values, returning the values
const setValueFrom = (spectrum: AlloyComponent, detail: SliderDetail, value: SugarPosition): SliderValueXY => {
  const xValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.left());
  const yValue = VerticalModel.findValueOfOffset(spectrum, detail, value.top());
  const val = sliderValue(xValue, yValue);
  fireSliderChange(spectrum, val);
  return val;
};

// move in a direction by step size. Fire change at the end
const moveBy = (direction: number, isVerticalMovement: boolean, spectrum: AlloyComponent, detail: SliderDetail): Option<number> => {
  const f = (direction > 0) ? SliderModel.increaseBy : SliderModel.reduceBy;
  const xValue = isVerticalMovement ? currentValue(detail).x() :
    f(currentValue(detail).x(), minX(detail), maxX(detail), step(detail));
  const yValue = !isVerticalMovement ? currentValue(detail).y() :
    f(currentValue(detail).y(), minY(detail), maxY(detail), step(detail));

  fireSliderChange(spectrum, sliderValue(xValue, yValue));
  return Option.some(xValue);
};

const handleMovement = (direction: number, isVerticalMovement: boolean) => (spectrum: AlloyComponent, detail: SliderDetail): Option<boolean> => {
  return moveBy(direction, isVerticalMovement, spectrum, detail).map(() => true);
};

// fire a slider change event with the minimum value
const setToMin = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const mX = minX(detail);
  const mY = minY(detail);
  fireSliderChange(spectrum, sliderValue(mX, mY));
};

// fire a slider change event with the maximum value
const setToMax = (spectrum: AlloyComponent, detail: SliderDetail): void => {
  const mX = maxX(detail);
  const mY = maxY(detail);
  fireSliderChange(spectrum, sliderValue(mX, mY));
};

// get event data as a SugarPosition
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent): Option<SugarPosition> => {
  return ModelCommon.getEventSource(simulatedEvent);
};

// update the position of the thumb from the slider's current value
const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, edges: SliderModelDetailParts): void => {
  const value = currentValue(detail);
  const xPos = HorizontalModel.findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.x(),
    edges.getLeftEdge(slider),
    edges.getRightEdge(slider),
    detail
  );
  const yPos = VerticalModel.findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.y(),
    edges.getTopEdge(slider),
    edges.getBottomEdge(slider),
    detail
  );
  const thumbXRadius = Width.get(thumb.element()) / 2;
  const thumbYRadius = Height.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'left', (xPos - thumbXRadius) + 'px');
  Css.set(thumb.element(), 'top', (yPos - thumbYRadius) + 'px');
};

// Key Events
const onLeft = handleMovement(-1, false);
const onRight = handleMovement(1, false);
const onUp = handleMovement(-1, true);
const onDown = handleMovement(1, true);

// Edge Click Actions
const edgeActions = {
  'top-left': Option.some(EdgeActions.setToTLEdgeXY),
  'top': Option.some(EdgeActions.setToTEdgeXY),
  'top-right': Option.some(EdgeActions.setToTREdgeXY),
  'right': Option.some(EdgeActions.setToREdgeXY),
  'bottom-right': Option.some(EdgeActions.setToBREdgeXY),
  'bottom': Option.some(EdgeActions.setToBEdgeXY),
  'bottom-left': Option.some(EdgeActions.setToBLEdgeXY),
  'left': Option.some(EdgeActions.setToLEdgeXY)
};

export {
  setValueFrom,
  setToMin,
  setToMax,
  getValueFromEvent,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
};