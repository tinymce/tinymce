import type { ColourTypes } from '@ephox/acid';
import type { CustomEvent, SliderTypes } from '@ephox/alloy';
import { Id } from '@ephox/katamari';

export interface SliderUpdateEvent extends CustomEvent {
  readonly value: SliderTypes.SliderValueY;
}

export interface PaletteUpdateEvent extends CustomEvent {
  readonly value: SliderTypes.SliderValueXY;
}

export interface FieldsUpdateEvent extends CustomEvent {
  readonly hex: ColourTypes.Hex;
}

const fieldsUpdate = Id.generate('rgb-hex-update');
const sliderUpdate = Id.generate('slider-update');
const paletteUpdate = Id.generate('palette-update');

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};