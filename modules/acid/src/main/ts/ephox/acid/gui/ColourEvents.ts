import { CustomEvent, SliderTypes } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

const fieldsUpdate = Id.generate('rgb-hex-update');
const sliderUpdate = Id.generate('slider-update');
const paletteUpdate = Id.generate('palette-update');

export interface SliderUpdateEvent extends CustomEvent {
  value: () => SliderTypes.SliderValueY;
}

export interface PaletteUpdateEvent extends CustomEvent {
  value: () => SliderTypes.SliderValueXY;
}

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};
