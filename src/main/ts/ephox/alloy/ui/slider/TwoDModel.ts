import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

import * as ModelCommon from './ModelCommon';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderDetail, SliderValueXY, SliderModelDetailParts } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Fun, Option } from '@ephox/katamari';
import { Css, Width, Height } from '@ephox/sugar';

import * as HorizontalModel from './HorizontalModel';
import * as VerticalModel from './VerticalModel';
import { maxX, maxY, minX, minY, currentValue } from './SliderValues';
import * as EdgeActions from './EdgeActions';
import { SugarPosition } from 'ephox/alloy/alien/TypeDefinitions';

// fire slider change event with xy value
const fireSliderChange = (spectrum: AlloyComponent, value: SliderValueXY): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (x: number, y: number): SliderValueXY => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  }
};

// find both values of x and y offsets of where the mouse was clicked from the model.
// then fire a slider change event with those values, returning the values
const setValueFrom = (spectrum: AlloyComponent, detail: SliderDetail, value: SugarPosition): SliderValueXY => {
  const xValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.left());
  const yValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.top());
  const val = sliderValue(xValue, yValue);
  fireSliderChange(spectrum, val);
  return val;
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
const onLeft = HorizontalModel.onLeft;
const onRight = HorizontalModel.onRight;
const onUp = VerticalModel.onUp;
const onDown = VerticalModel.onDown;

// Edge Click Actions
const edgeActions = Fun.constant({
  'top-left': Option.some(EdgeActions.setToTLedgeXY),
  'top': Option.some(EdgeActions.setToTedgeXY),
  'top-right': Option.some(EdgeActions.setToTRedgeXY),
  'right': Option.some(EdgeActions.setToRedgeXY),
  'bottom-right': Option.some(EdgeActions.setToBRedgeXY),
  'bottom': Option.some(EdgeActions.setToBedgeXY),
  'bottom-left': Option.some(EdgeActions.setToBLedgeXY),
  'left': Option.some(EdgeActions.setToLedgeXY)
});

export {
  setValueFrom,
  getValueFromEvent,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
}