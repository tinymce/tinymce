/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

interface ColorSwatchDialogData {
  colorpicker: string;
}

const mapColors = (colorMap: string[]): Menu.ChoiceMenuItemSpec[] => {
  const colors: Menu.ChoiceMenuItemSpec[] = [];

  const canvas = document.createElement('canvas');
  canvas.height = 1;
  canvas.width = 1;
  const canvasContext = canvas.getContext('2d');

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

const applyColorSetup = (_editor: Editor, value: string, setColor: (colorValue: string) => void) => {
  if (value === 'remove') {
    setColor('');
  } else {
    setColor(value);
  }
};

export {
  applyColorSetup,
  ColorSwatchDialogData,
  mapColors
};
