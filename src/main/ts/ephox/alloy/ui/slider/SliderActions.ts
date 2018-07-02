import { Fun } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { SliderValue, SliderDetail } from '../../ui/types/SliderTypes';

import * as SliderPosition from './SliderPositions';

const _sliderChangeEvent = 'slider.change.value';

const fireSliderChange = (component: AlloyComponent, value: SliderValue): void => {
  AlloyTriggers.emitWith(component, _sliderChangeEvent, { value });
};

// North West
const setToTLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.topLeft(detail));
};

// North
const setToTedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.top(detail));
};

//North East
const setToTRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.topRight(detail));
};

// East
const setToRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.right(detail));
};

// South East
const setToBRedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottomRight(detail));
};

// South
const setToBedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottom(detail));
};

// South West
const setToBLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.bottomLeft(detail));
};

// West
const setToLedge = (edge: AlloyComponent, detail: SliderDetail): void => {
  fireSliderChange(edge, SliderPosition.left(detail));
};


const sliderChangeEvent = Fun.constant(_sliderChangeEvent);

export {
  setToLedge,
  setToRedge,
  setToTedge,
  setToBedge,
  setToTLedge,
  setToTRedge,
  setToBLedge,
  setToBRedge,
  sliderChangeEvent
};