import { Id, Fun } from '@ephox/katamari';
import { SliderTypes, EventFormat } from '@ephox/alloy';

const fieldsUpdate = Fun.constant(Id.generate('rgb-hex-update'));
const sliderUpdate = Fun.constant(Id.generate('slider-update'));
const paletteUpdate = Fun.constant(Id.generate('palette-update'));

export interface SliderUpdateEvent extends EventFormat {
  value: () => SliderTypes.SliderValueY;
}

export interface PaletteUpdateEvent extends EventFormat {
  value: () => SliderTypes.SliderValueXY;
}

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};