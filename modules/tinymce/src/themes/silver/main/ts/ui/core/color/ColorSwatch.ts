/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HexColour, RgbaColour } from '@ephox/acid';
import { Cell, Fun, Optional, Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog, Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Events from '../../../api/Events';
import * as Settings from './Settings';

export type ColorInputCallback = (valueOpt: Optional<string>) => void;

export interface ColorSwatchDialogData {
  colorpicker: string;
}

type ColorFormat = 'forecolor' | 'hilitecolor';

const fallbackColor = '#000000';

const getCurrentColor = (editor: Editor, format: ColorFormat): Optional<string> => {
  let color: string | undefined;

  editor.dom.getParents(editor.selection.getStart(), (elm) => {
    let value;

    if ((value = elm.style[format === 'forecolor' ? 'color' : 'background-color'])) {
      color = color ? color : value;
    }
  });

  return Optional.from(color);
};

const applyFormat = (editor: Editor, format, value) => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.formatter.apply(format, { value });
    editor.nodeChanged();
  });
};

const removeFormat = (editor: Editor, format) => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.formatter.remove(format, { value: null }, null, true);
    editor.nodeChanged();
  });
};

const registerCommands = (editor: Editor) => {
  editor.addCommand('mceApplyTextcolor', (format, value) => {
    applyFormat(editor, format, value);
  });

  editor.addCommand('mceRemoveTextcolor', (format) => {
    removeFormat(editor, format);
  });
};

const calcCols = (colors: number) => Math.max(5, Math.ceil(Math.sqrt(colors)));

const getColorCols = (editor: Editor) => {
  const colors = Settings.getColors(editor);
  const defaultCols = calcCols(colors.length);
  return Settings.getColorCols(editor, defaultCols);
};

const getAdditionalColors = (hasCustom: boolean): Menu.ChoiceMenuItemSpec[] => {
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

const applyColor = (editor: Editor, format, value, onChoice: (v: string) => void) => {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((colorOpt) => {
      colorOpt.each((color) => {
        Settings.addColor(color);
        editor.execCommand('mceApplyTextcolor', format, color);
        onChoice(color);
      });
    }, fallbackColor);
  } else if (value === 'remove') {
    onChoice('');
    editor.execCommand('mceRemoveTextcolor', format);
  } else {
    onChoice(value);
    editor.execCommand('mceApplyTextcolor', format, value);
  }
};

const getColors = (colors: Menu.ChoiceMenuItemSpec[], hasCustom: boolean): Menu.ChoiceMenuItemSpec[] => colors.concat(Settings.getCurrentColors().concat(getAdditionalColors(hasCustom)));

const getFetch = (colors: Menu.ChoiceMenuItemSpec[], hasCustom: boolean) => (callback) => {
  callback(getColors(colors, hasCustom));
};

const setIconColor = (splitButtonApi: Toolbar.ToolbarSplitButtonInstanceApi, name: string, newColor: string) => {
  const id = name === 'forecolor' ? 'tox-icon-text-color__color' : 'tox-icon-highlight-bg-color__color';
  splitButtonApi.setIconFill(id, newColor);
};

const registerTextColorButton = (editor: Editor, name: string, format: ColorFormat, tooltip: string, lastColor: Cell<string>) => {
  editor.ui.registry.addSplitButton(name, {
    tooltip,
    presets: 'color',
    icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
    select: (value) => {
      const optCurrentRgb = getCurrentColor(editor, format);
      return optCurrentRgb.bind((currentRgb) => RgbaColour.fromString(currentRgb).map((rgba) => {
        const currentHex = HexColour.fromRgba(rgba).value;
        // note: value = '#FFFFFF', currentHex = 'ffffff'
        return Strings.contains(value.toLowerCase(), currentHex);
      })).getOr(false);
    },
    columns: getColorCols(editor),
    fetch: getFetch(Settings.getColors(editor), Settings.hasCustomColors(editor)),
    onAction: (_splitButtonApi) => {
      applyColor(editor, format, lastColor.get(), Fun.noop);
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
      setIconColor(splitButtonApi, name, lastColor.get());

      const handler = (e) => {
        if (e.name === name) {
          setIconColor(splitButtonApi, e.name, e.color);
        }
      };

      editor.on('TextColorChange', handler);

      return () => {
        editor.off('TextColorChange', handler);
      };
    }
  });
};

const registerTextColorMenuItem = (editor: Editor, name: string, format: ColorFormat, text: string) => {
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

const register = (editor: Editor) => {
  registerCommands(editor);
  const lastForeColor = Cell(fallbackColor);
  const lastBackColor = Cell(fallbackColor);
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
  getAdditionalColors,
  calcCols
};
