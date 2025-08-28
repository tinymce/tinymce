import { Hex, Hsv } from './ColourTypes';
import * as HexColour from './HexColour';
import * as HsvColour from './HsvColour';
import * as RgbaColour from './RgbaColour';

const hexToHsv = (hex: Hex): Hsv => HsvColour.fromRgb(RgbaColour.fromHex(hex));
const hsvToHex = (hsv: Hsv): Hex => HexColour.fromRgba(RgbaColour.fromHsv(hsv));

const anyToHex = (color: string): Hex =>
  HexColour.fromString(color)
    .orThunk(() => RgbaColour.fromString(color).map(HexColour.fromRgba))
    .getOrThunk(() => {
      // Not dealing with Hex or RGBA so use a canvas to parse the color
      const canvas = document.createElement('canvas');
      canvas.height = 1;
      canvas.width = 1;
      const canvasContext = canvas.getContext('2d') as CanvasRenderingContext2D;

      // all valid colors after this point
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
      // invalid colors will be shown as white - the first assignment will pass and the second may be ignored
      canvasContext.fillStyle = '#FFFFFF';
      canvasContext.fillStyle = color;
      canvasContext.fillRect(0, 0, 1, 1);

      const rgba = canvasContext.getImageData(0, 0, 1, 1).data;
      const r = rgba[0];
      const g = rgba[1];
      const b = rgba[2];
      const a = rgba[3];

      return HexColour.fromRgba(RgbaColour.rgbaColour(r, g, b, a));
    });

const rgbaToHexString = (color: string): string =>
  RgbaColour.fromString(color)
    .map(HexColour.fromRgba)
    .map((h) => '#' + h.value)
    .getOr(color);

export {
  anyToHex,
  rgbaToHexString,
  hexToHsv,
  hsvToHex
};
