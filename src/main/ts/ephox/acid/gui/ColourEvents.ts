import { Id, Fun } from "@ephox/katamari";

const fieldsUpdate = Fun.constant(Id.generate('rgb-hex-update'));
const sliderUpdate = Fun.constant(Id.generate('slider-update'));
const paletteUpdate = Fun.constant(Id.generate('palette-update'));

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};