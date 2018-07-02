import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

import * as ModelCommon from './ModelCommon';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderDetail, SliderValue } from '../../ui/types/SliderTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Fun } from '@ephox/katamari';
import { Css, Width, Height } from '@ephox/sugar';

import * as HorizontalModel from './HorizontalModel';
import * as VerticalModel from './VerticalModel';
import { currentValue } from './SliderValues';

const fireSliderChange = (spectrum: AlloyComponent, value: SliderValue): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (x: number, y: number): SliderValue => {
  return {
    x: Fun.constant(x),
    y: Fun.constant(y)
  }
};

// Which does a SET. Fire change at the end
const setValueTo = (spectrum, detail, value) => {
  const xValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.x());
  const yValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.y());
  const val = sliderValue(xValue, yValue);
  fireSliderChange(spectrum, val);
  return val;
};

// get event data
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent) => {
  const pos = ModelCommon.getEventSource(simulatedEvent);
  return pos.map(function (p) {
    return p.left();
  });
};

const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, edges: any) => {
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
    edges.getLeftEdge(slider),
    edges.getRightEdge(slider),
    detail
  );
  const thumbXRadius = Width.get(thumb.element()) / 2;
  const thumbYRadius = Height.get(thumb.element()) / 2;
  Css.set(thumb.element(), 'left', (xPos - thumbXRadius) + 'px');
  Css.set(thumb.element(), 'top', (yPos - thumbYRadius) + 'px');
};

const onLeft = HorizontalModel.onLeft;
const onRight = HorizontalModel.onLeft;
const onUp = VerticalModel.onUp;
const onDown = VerticalModel.onDown;

export {
  setValueTo,
  getValueFromEvent,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown
}