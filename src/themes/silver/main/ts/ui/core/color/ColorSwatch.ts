/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HexColour, RgbaColour } from '@ephox/acid';
import { Menu, Toolbar, Types } from '@ephox/bridge';
import { Cell, Option, Strings } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import Settings from './Settings';

export interface ColorSwatchDialogData {
  colorpicker: string;
}

const getCurrentColor = function (editor: Editor, format) {
  let color;

  editor.dom.getParents(editor.selection.getStart(), function (elm) {
    let value;

    if ((value = elm.style[format === 'forecolor' ? 'color' : 'background-color'])) {
      color = color ? color : value;
    }
  });

  return color;
};

const applyFormat = function (editor: Editor, format, value) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.apply(format, { value });
    editor.nodeChanged();
  });
};

const removeFormat = function (editor: Editor, format) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.remove(format, { value: null }, null, true);
    editor.nodeChanged();
  });
};

const registerCommands = (editor: Editor) => {
  editor.addCommand('mceApplyTextcolor', function (format, value) {
    applyFormat(editor, format, value);
  });

  editor.addCommand('mceRemoveTextcolor', function (format) {
    removeFormat(editor, format);
  });
};

const calcCols = (colors) => {
  return Math.max(5, Math.ceil(Math.sqrt(colors)));
};

const getColorCols = function (editor: Editor) {
  const colors = Settings.getColors(editor);
  const defaultCols = calcCols(colors.length);
  return Settings.getColorCols(editor, defaultCols);
};

const getAdditionalColors = (hasCustom: boolean): Menu.ChoiceMenuItemApi[] => {
  const type: 'choiceitem' = 'choiceitem';
  const remove = {
    type,
    text: 'Remove color',
    icon: 'color-swatch-remove-color',
    value: 'remove'
  };
  const custom = {
    type,
    text: 'Custom color',
    icon: 'color-picker',
    value: 'custom'
  };
  return hasCustom ? [
    remove,
    custom
  ] : [remove];
};

const applyColour = function (editor: Editor, format, value, onChoice: (v: string) => void) {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((colorOpt) => {
      colorOpt.each((color) => {
        Settings.addColor(color);
        editor.execCommand('mceApplyTextcolor', format, color);
        onChoice(color);
      });
    }, '#000000');
  } else if (value === 'remove') {
    onChoice('');
    editor.execCommand('mceRemoveTextcolor', format);
  } else {
    onChoice(value);
    editor.execCommand('mceApplyTextcolor', format, value);
  }
};

const getFetch = (colors: Menu.ChoiceMenuItemApi[], hasCustom: boolean) => (callback) => {
  callback(
    colors.concat(Settings.getCurrentColors().concat(getAdditionalColors(hasCustom)))
  );
};

const registerTextColorButton = (editor: Editor, name: string, format: string, tooltip: string) => {
  editor.ui.registry.addSplitButton(name, (() => {
    const lastColour = Cell(null);
    return {
      type: 'splitbutton',
      tooltip,
      presets: 'color',
      icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
      select: (value) => {
        const optCurrentRgb = Option.from(getCurrentColor(editor, format));
        return optCurrentRgb.bind((currentRgb) => {
          return RgbaColour.fromString(currentRgb).map((rgba) => {
            const currentHex = HexColour.fromRgba(rgba).value();
            // note: value = '#FFFFFF', currentHex = 'ffffff'
            return Strings.contains(value.toLowerCase(), currentHex);
          });
        }).getOr(false);
      },
      columns: getColorCols(editor),
      fetch: getFetch(Settings.getColors(editor), Settings.hasCustomColors(editor)),
      onAction: (splitButtonApi) => {
        // do something with last colour
        if (lastColour.get() !== null) {
          applyColour(editor, format, lastColour.get(), () => { });
        }
      },
      onItemAction: (splitButtonApi, value) => {
        applyColour(editor, format, value, (newColour) => {

          const setIconFillAndStroke = (pathId, colour) => {
            splitButtonApi.setIconFill(pathId, colour);
            splitButtonApi.setIconStroke(pathId, colour);
          };

          lastColour.set(newColour);
          const id = name === 'forecolor' ? 'tox-icon-text-color__color' : 'tox-icon-highlight-bg-color__color';
          setIconFillAndStroke(id, newColour);
        });
      }
    } as Toolbar.ToolbarSplitButtonApi;
  })());
};

const colorPickerDialog = (editor: Editor) => (callback, value: string) => {
  const getOnSubmit = (callback) => {
    return (api) => {
      const data = api.getData();
      callback(Option.from(data.colorpicker));
      api.close();
    };
  };

  const onAction = (api: Types.Dialog.DialogInstanceApi<ColorSwatchDialogData>, details) => {
    if (details.name === 'hex-valid') {
      if (details.value) {
        api.enable('ok');
      } else {
        api.disable('ok');
      }
    }
  };

  const initialData: ColorSwatchDialogData = {
    colorpicker: value
  };

  const submit = getOnSubmit(callback);
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
        text: 'Cancel',
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
    onSubmit: submit,
    onClose: () => { },
    onCancel: () => {
      callback(Option.none());
    }
  });
};

const register = (editor: Editor) => {
  registerCommands(editor);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Text color');
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background color');
};

export default { register, getFetch, colorPickerDialog, getCurrentColor, getColorCols, calcCols};