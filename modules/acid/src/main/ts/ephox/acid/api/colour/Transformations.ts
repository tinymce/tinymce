import { Menu } from '@ephox/bridge';
import { Type } from '@ephox/katamari';
import { Hex, Hsv } from './ColourTypes';
import * as HexColour from './HexColour';
import * as HsvColour from './HsvColour';
import * as RgbaColour from './RgbaColour';

const hexToHsv = (hex: Hex): Hsv => HsvColour.fromRgb(RgbaColour.fromHex(hex));
const hsvToHex = (hsv: Hsv): Hex => HexColour.fromRgba(RgbaColour.fromHsv(hsv));

const anyToHex = (colorMap: string[]): Menu.ChoiceMenuItemSpec[] => {
  const colors: Menu.ChoiceMenuItemSpec[] = [];

  const canvas = document.createElement('canvas');
  canvas.height = 1;
  canvas.width = 1;
  const canvasContext = canvas.getContext('2d');

  if (Type.isNull(canvasContext)) {
    return [];
  }

  const byteAsHex = (colorByte: number, alphaByte: number) => {
    const bg = 255;
    const alpha = (alphaByte / 255);
    const colorByteWithWhiteBg = Math.round((colorByte * alpha) + (bg * (1 - alpha)));
    return ('0' + colorByteWithWhiteBg.toString(16)).slice(-2).toUpperCase();
  };

  const asHexColor = (color: string) => {
    // backwards compatibility
    if (/^[0-9A-Fa-f]{6}$/.test(color)) {
      return '#' + color.toUpperCase();
    }
    // all valid colors after this point
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    // invalid colors will be shown as white - the first assignment will pass and the second may be ignored
    canvasContext.fillStyle = '#FFFFFF'; // lgtm[js/useless-assignment-to-property]
    canvasContext.fillStyle = color;
    canvasContext.fillRect(0, 0, 1, 1);
    const rgba = canvasContext.getImageData(0, 0, 1, 1).data;
    const r = rgba[0], g = rgba[1], b = rgba[2], a = rgba[3];
    return '#' + byteAsHex(r, a) + byteAsHex(g, a) + byteAsHex(b, a);
  };

  for (let i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      value: asHexColor(colorMap[i]),
      type: 'choiceitem'
    });
  }

  return colors;
};

export {
  hexToHsv,
  anyToHex,
  hsvToHex
};
