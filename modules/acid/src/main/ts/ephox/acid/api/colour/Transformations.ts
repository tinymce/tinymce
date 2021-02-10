import { Hex, Hsv } from './ColourTypes';
import * as HexColour from './HexColour';
import * as HsvColour from './HsvColour';
import * as RgbaColour from './RgbaColour';

const hex2hsv = (hex: Hex): Hsv => HsvColour.fromRgb(RgbaColour.fromHex(hex));
const hsv2hex = (hsv: Hsv): Hex => HexColour.fromRgba(RgbaColour.fromHsv(hsv));

export {
  hex2hsv,
  hsv2hex
};
