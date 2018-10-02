import * as HsvColour from '../api/colour/HsvColour';
import * as RgbaColour from '../api/colour/RgbaColour'
import * as HexColour from '../api/colour/HexColour';

const calcHex = (value) => {
  var hue = ((100 - value / 100) * 360);
  var hsv = HsvColour.hsvColour(hue, 100, 100);
  const rgb = RgbaColour.fromHsv(hsv);
  return HexColour.fromRgba(rgb);
};

export {
  calcHex
}