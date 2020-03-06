import { Id } from '@ephox/katamari';
import { SliderTypes, EventFormat } from '@ephox/alloy';

const fieldsUpdate = Id.generate('rgb-hex-update');
const sliderUpdate = Id.generate('slider-update');
const paletteUpdate = Id.generate('palette-update');

export interface SliderUpdateEvent extends EventFormat {
  value: SliderTypes.SliderValueY;
}

export interface PaletteUpdateEvent extends EventFormat {
  value: SliderTypes.SliderValueXY;
}

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};
