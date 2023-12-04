import { HexColour, RgbaColour } from '@ephox/acid';
import { Arr, Cell, Fun, Optional, Optionals, Strings } from '@ephox/katamari';
import { Css, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Dialog, Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import * as Events from '../../../api/Events';
import { composeUnbinders, onSetupEditableToggle } from '../ControlUtils';
import * as ColorCache from './ColorCache';
import * as Options from './Options';

export type ColorInputCallback = (valueOpt: Optional<string>) => void;

export interface ColorSwatchDialogData {
  readonly colorpicker: string;
}

type ColorFormat = 'forecolor' | 'hilitecolor';

const defaultBackgroundColor = 'rgba(0, 0, 0, 0)';

const isValidBackgroundColor = (value: string) =>
  RgbaColour.fromString(value).exists((c) => c.alpha !== 0);

// Climb up the tree to find the value of the background until finding a non-transparent value or defaulting.
const getClosestCssBackgroundColorValue = (scope: SugarElement<Element>): string => {
  return TransformFind.closest(scope, (node) => {
    if (SugarNode.isElement(node)) {
      const color = Css.get(node, 'background-color');
      return Optionals.someIf(isValidBackgroundColor(color), color);
    } else {
      return Optional.none();
    }
  }).getOr(defaultBackgroundColor);
};

const getCurrentColor = (editor: Editor, format: ColorFormat): Optional<string> => {
  const node = SugarElement.fromDom(editor.selection.getStart());
  const cssRgbValue = format === 'hilitecolor'
    ? getClosestCssBackgroundColorValue(node)
    : Css.get(node, 'color');

  return RgbaColour.fromString(cssRgbValue).map((rgba) => '#' + HexColour.fromRgba(rgba).value);
};

const applyFormat = (editor: Editor, format: ColorFormat, value: string) => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.formatter.apply(format, { value });
    editor.nodeChanged();
  });
};

const removeFormat = (editor: Editor, format: ColorFormat) => {
  editor.undoManager.transact(() => {
    editor.focus();
    editor.formatter.remove(format, { value: null }, undefined, true);
    editor.nodeChanged();
  });
};

const registerCommands = (editor: Editor) => {
  editor.addCommand('mceApplyTextcolor', (format, value) => {
    applyFormat(editor, format as any, value);
  });

  editor.addCommand('mceRemoveTextcolor', (format) => {
    removeFormat(editor, format as any);
  });
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

const applyColor = (editor: Editor, format: ColorFormat, value: string, onChoice: (v: string) => void) => {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((colorOpt) => {
      colorOpt.each((color) => {
        ColorCache.addColor(format, color);
        editor.execCommand('mceApplyTextcolor', format as any, color);
        onChoice(color);
      });
    }, getCurrentColor(editor, format).getOr(Options.fallbackColor));
  } else if (value === 'remove') {
    onChoice('');
    editor.execCommand('mceRemoveTextcolor', format as any);
  } else {
    onChoice(value);
    editor.execCommand('mceApplyTextcolor', format as any, value);
  }
};

const getColors = (colors: Menu.ChoiceMenuItemSpec[], id: string, hasCustom: boolean): Menu.ChoiceMenuItemSpec[] =>
  colors.concat(ColorCache.getCurrentColors(id).concat(getAdditionalColors(hasCustom)));

const getFetch = (colors: Menu.ChoiceMenuItemSpec[], id: string, hasCustom: boolean) => (callback: (value: Menu.ChoiceMenuItemSpec[]) => void): void => {
  callback(getColors(colors, id, hasCustom));
};

const setIconColor = (splitButtonApi: Toolbar.ToolbarSplitButtonInstanceApi | Menu.NestedMenuItemInstanceApi, name: string, newColor: string) => {
  const id = name === 'forecolor' ? 'tox-icon-text-color__color' : 'tox-icon-highlight-bg-color__color';
  splitButtonApi.setIconFill(id, newColor);
};

const setTooltip = (buttonApi: Toolbar.ToolbarSplitButtonInstanceApi | Menu.NestedMenuItemInstanceApi, tooltip: string) => {
  buttonApi.setTooltip(tooltip);
};

const select = (editor: Editor, format: ColorFormat) =>
  (value: string) => {
    const optCurrentHex = getCurrentColor(editor, format);
    return Optionals.is(optCurrentHex, value.toUpperCase());
  };

// Selecting `Remove Color` would set the lastColor to ''
const getToolTipText = (editor: Editor, format: ColorFormat, lastColor: string) => {
  if (Strings.isEmpty(lastColor)) {
    return format === 'forecolor' ? 'Text color' : 'Background color';
  }

  const tooltipPrefix = format === 'forecolor' ? 'Text color {0}' : 'Background color {0}';
  const colors = getColors(Options.getColors(editor, format), format, false);
  const colorText = Arr.find(colors, (c) => c.value === lastColor).getOr({ text: '' }).text;

  return editor.translate([ tooltipPrefix, editor.translate(colorText) ]);
};

const registerTextColorButton = (editor: Editor, name: string, format: ColorFormat, lastColor: Cell<string>) => {
  editor.ui.registry.addSplitButton(name, {
    tooltip: getToolTipText(editor, format, lastColor.get()),
    presets: 'color',
    icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
    select: select(editor, format),
    columns: Options.getColorCols(editor, format),
    fetch: getFetch(Options.getColors(editor, format), format, Options.hasCustomColors(editor)),
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

      const handler = (e: EditorEvent<{ name: string; color: string }>) => {
        if (e.name === name) {
          setIconColor(splitButtonApi, e.name, e.color);
          setTooltip(splitButtonApi, getToolTipText(editor, format, e.color));
        }
      };

      editor.on('TextColorChange', handler);

      return composeUnbinders(
        onSetupEditableToggle(editor)(splitButtonApi),
        () => {
          editor.off('TextColorChange', handler);
        }
      );
    }
  });
};

const registerTextColorMenuItem = (editor: Editor, name: string, format: ColorFormat, text: string, lastColor: Cell<string>) => {
  editor.ui.registry.addNestedMenuItem(name, {
    text,
    icon: name === 'forecolor' ? 'text-color' : 'highlight-bg-color',
    onSetup: (api) => {
      setTooltip(api, getToolTipText(editor, format, lastColor.get()));
      setIconColor(api, name, lastColor.get());
      return onSetupEditableToggle(editor)(api);
    },
    getSubmenuItems: () => [
      {
        type: 'fancymenuitem',
        fancytype: 'colorswatch',
        select: select(editor, format),
        initData: {
          storageKey: format,
        },
        onAction: (data) => {
          applyColor(editor, format, data.value, (newColor) => {
            lastColor.set(newColor);

            Events.fireTextColorChange(editor, {
              name,
              color: newColor
            });
          } );
        },
      }
    ]
  });
};

const colorPickerDialog = (editor: Editor) => (callback: ColorInputCallback, value: string): void => {
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

  const onAction = (_api: Dialog.DialogInstanceApi<ColorSwatchDialogData>, details: Dialog.DialogActionDetails) => {
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

const register = (editor: Editor): void => {
  registerCommands(editor);
  const fallbackColorForeground = Options.getDefaultForegroundColor(editor);
  const fallbackColorBackground = Options.getDefaultBackgroundColor(editor);
  const lastForeColor = Cell(fallbackColorForeground);
  const lastBackColor = Cell(fallbackColorBackground);
  registerTextColorButton(editor, 'forecolor', 'forecolor', lastForeColor);
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', lastBackColor);

  registerTextColorMenuItem(editor, 'forecolor', 'forecolor', 'Text color', lastForeColor);
  registerTextColorMenuItem(editor, 'backcolor', 'hilitecolor', 'Background color', lastBackColor);
};

export {
  register,
  getColors,
  getFetch,
  colorPickerDialog,
  getCurrentColor,
  getAdditionalColors
};
