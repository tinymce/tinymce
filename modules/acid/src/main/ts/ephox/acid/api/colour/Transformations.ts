import { Hex, Hsv } from './ColourTypes';
import * as HexColour from './HexColour';
import * as HsvColour from './HsvColour';
import * as RgbaColour from './RgbaColour';

const hexToHsv = (hex: Hex): Hsv => HsvColour.fromRgb(RgbaColour.fromHex(hex));
const hsvToHex = (hsv: Hsv): Hex => HexColour.fromRgba(RgbaColour.fromHsv(hsv));

export {
  hexToHsv,
  hsvToHex
};
