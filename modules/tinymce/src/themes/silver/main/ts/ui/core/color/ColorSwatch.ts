/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HexColour, RgbaColour } from '@ephox/acid';
import { Menu, Toolbar, Types } from '@ephox/bridge';
import { Cell, Fun, Option, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Events from '../../../api/Events';
import * as Settings from './Settings';

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

const calcCols = (colors) => Math.max(5, Math.ceil(Math.sqrt(colors)));

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
  ] : [ remove ];
};

const applyColor = function (editor: Editor, format, value, onChoice: (v: string) => void) {
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

const getColors = (colors: Menu.ChoiceMenuItemApi[], hasCustom: boolean): Menu.ChoiceMenuItemApi[] => colors.concat(Settings.getCurrentColors().concat(getAdditionalColors(hasCustom)));

const getFetch = (colors: Menu.ChoiceMenuItemApi[], hasCustom: boolean) => (callback) => {
  callback(getColors(colors, hasCustom));
};

const setIconColor = (splitButtonApi: Toolbar.ToolbarSplitButtonInstanceApi, name: string, newColor: string) => {
  const setIconFillAndStroke = (pathId, color) => {
    splitButtonApi.setIconFill(pathId, color);
    splitButtonApi.setIconStroke(pathId, color);
  };

  const id = name === 'forecolor' ? 'tox-icon-text-color__color' : 'tox-icon-highlight-bg-color__color';
  setIconFillAndStroke(id, newColor);
};

const registerTextColorButton = (editor: Editor, name: string, format: string, tooltip: string, lastColor: Cell<string>) => {
  editor.ui.registry.addSplitButton(name, {
    tooltip,
    presets: 'color',
    icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
    select: (value) => {
      const optCurrentRgb = Option.from(getCurrentColor(editor, format));
      return optCurrentRgb.bind((currentRgb) => RgbaColour.fromString(currentRgb).map((rgba) => {
        const currentHex = HexColour.fromRgba(rgba).value;
        // note: value = '#FFFFFF', currentHex = 'ffffff'
        return Strings.contains(value.toLowerCase(), currentHex);
      })).getOr(false);
    },
    columns: getColorCols(editor),
    fetch: getFetch(Settings.getColors(editor), Settings.hasCustomColors(editor)),
    onAction: (_splitButtonApi) => {
      // do something with last color
      if (lastColor.get() !== null) {
        applyColor(editor, format, lastColor.get(), () => { });
      }
    },
    onItemAction: (_splitButtonApi, value) => {
      applyColor(editor, format, value, (newColor) => {
        lastColor.set(newColor);

        Events.fireTextColorChange(editor, {
          name,
          color: newColor
        });
      });
    },
    onSetup: (splitButtonApi) => {
      if (lastColor.get() !== null) {
        setIconColor(splitButtonApi, name, lastColor.get());
      }

      const handler = (e) => {
        if (e.name === name) {
          setIconColor(splitButtonApi, e.name, e.color);
        }
      };

      editor.on('TextColorChange', handler);

      return () => { editor.off('TextColorChange', handler); };
    }
  });
};

const registerTextColorMenuItem = (editor: Editor, name: string, format: string, text: string) => {
  editor.ui.registry.addNestedMenuItem(name, {
    text,
    icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
    getSubmenuItems: () => [
      {
        type: 'fancymenuitem',
        fancytype: 'colorswatch',
        onAction: (data) => {
          applyColor(editor, format, data.value, Fun.noop);
        }
      }
    ]
  });
};

const colorPickerDialog = (editor: Editor) => (callback, value: string) => {
  const getOnSubmit = (callback) => (api) => {
    const data = api.getData();
    callback(Option.from(data.colorpicker));
    api.close();
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
    onSubmit: submit,
    onClose: () => { },
    onCancel: () => {
      callback(Option.none());
    }
  });
};

const register = (editor: Editor) => {
  registerCommands(editor);
  const lastForeColor = Cell(null);
  const lastBackColor = Cell(null);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Text color', lastForeColor);
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background color', lastBackColor);

  registerTextColorMenuItem(editor, 'forecolor', 'forecolor', 'Text color');
  registerTextColorMenuItem(editor, 'backcolor', 'hilitecolor', 'Background color');
};

export {
  register,
  getColors,
  getFetch,
  colorPickerDialog,
  getCurrentColor,
  getColorCols,
  calcCols
};
