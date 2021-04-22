/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Menu } from 'tinymce/core/api/ui/Ui';

type ColorInputCallback = (valueOpt: Optional<string>) => void;

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
    const value = colorMap[i];

    if (value === 'remove') {
      colors.push({
        type: 'choiceitem',
        text: 'Remove color',
        icon: 'color-swatch-remove-color',
        value: 'remove'
      });
    } else if (value === 'custom') {
      colors.push({
        type: 'choiceitem',
        text: 'Custom color',
        icon: 'color-picker',
        value: 'custom'
      });
    } else {
      colors.push({
        text: colorMap[i + 1],
        value: asHexColor(colorMap[i]),
        type: 'choiceitem'
      });
    }
  }

  return colors;
};

const applyColorSetup = (editor: Editor, value: string, setColor: (colorValue: string) => void) => {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((colorOpt) => {
      colorOpt.each(setColor);
    }, '#000000');
  } else if (value === 'remove') {
    setColor('');
  } else {
    setColor(value);
  }
};

const colorPickerDialog = (editor: Editor) => (callback: ColorInputCallback, value: string) => {
  let isValid = false;

  const onSubmit = (api: Dialog.DialogInstanceApi<ColorSwatchDialogData>) => {
    const data = api.getData();
    const hex = data.colorpicker;
    if (isValid) {
      callback(Optional.from(hex));
      api.close();
    } else {
      editor.windowManager.alert(editor.translate([ 'Invalid hex color code: {0}', hex ]));
    }
  };

  const onAction = (_api: Dialog.DialogInstanceApi<ColorSwatchDialogData>, details) => {
    if (details.name === 'hex-valid') {
      isValid = details.value;
    }
  };

  const initialData: ColorSwatchDialogData = {
    colorpicker: value
  };

  editor.windowManager.open({
    title: 'Color Picker',
    size: 'normal',
    body: {
      type: 'panel',
      items: [
        {
          type: 'colorpicker',
          name: 'colorpicker',
          label: 'Color'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        name: 'save',
        text: 'Save',
        primary: true
      }
    ],
    initialData,
    onAction,
    onSubmit,
    onClose: Fun.noop,
    onCancel: () => {
      callback(Optional.none());
    }
  });
};

export {
  applyColorSetup,
  ColorSwatchDialogData,
  mapColors
};
