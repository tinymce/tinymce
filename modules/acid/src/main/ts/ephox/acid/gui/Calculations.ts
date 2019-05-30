import * as HexColour from '../api/colour/HexColour';
import * as HsvColour from '../api/colour/HsvColour';
import * as RgbaColour from '../api/colour/RgbaColour';

const calcHex = (value: number) => {
  const hue = (((100 - value) / 100) * 360);
  const hsv = HsvColour.hsvColour(hue, 100, 100);
  const rgb = RgbaColour.fromHsv(hsv);
  return HexColour.fromRgba(rgb);
};

export {
  calcHex
};