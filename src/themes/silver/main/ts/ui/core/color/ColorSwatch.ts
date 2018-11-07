import { Cell } from '@ephox/katamari';

import { Menu, Toolbar } from '@ephox/bridge';
import Settings from './Settings';

const getCurrentColor = function (editor, format) {
  let color;

  editor.dom.getParents(editor.selection.getStart(), function (elm) {
    let value;

    if ((value = elm.style[format === 'forecolor' ? 'color' : 'background-color'])) {
      color = color ? color : value;
    }
  });

  return color;
};

const applyFormat = function (editor, format, value) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.apply(format, { value });
    editor.nodeChanged();
  });
};

const removeFormat = function (editor, format) {
  editor.undoManager.transact(function () {
    editor.focus();
    editor.formatter.remove(format, { value: null }, null, true);
    editor.nodeChanged();
  });
};

const registerCommands = (editor) => {
  editor.addCommand('mceApplyTextcolor', function (format, value) {
    applyFormat(editor, format, value);
  });

  editor.addCommand('mceRemoveTextcolor', function (format) {
    removeFormat(editor, format);
  });
};

const calcCols = (colors) => {
  return Math.ceil(Math.sqrt(colors));
};

const getColorCols = function (editor) {
  const colors = Settings.getCurrentColors();
  const defaultCols = calcCols(colors.length);
  return Settings.getColorCols(editor, defaultCols);
};

const getIcon = (color: string) => {
  if (color === 'remove') {
    return '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M25 5L5 25" stroke-width="1.5" fill="none"></path></svg>';
  } else if (color === 'custom') {
    return 'color-picker';
  } else {
    return `<div style="width: 24px; height: 24px; background-color: ${color};"></div>`;
  }
};

const getAdditionalColors = (hasCustom: boolean): Menu.ChoiceMenuItemApi[] => {
  const type: 'choiceitem' = 'choiceitem';
  const remove = {
    type,
    text: 'Remove',
    icon: getIcon('remove'),
    value: 'remove'
  };
  const custom = {
    type,
    text: 'Custom',
    icon: getIcon('custom'),
    value: 'custom'
  };
  return hasCustom ? [
    remove,
    custom
  ] : [remove];
};

const applyColour = function (editor, format, splitButtonApi, value, onChoice: (v: string) => void) {
  if (value === 'custom') {
    const dialog = colorPickerDialog(editor);
    dialog((color) => {
      Settings.addColor(color);
      editor.execCommand('mceApplyTextcolor', format, color);
      onChoice(color);
    }, '#000000');
  } else if (value === 'remove') {
    onChoice('');
    editor.execCommand('mceRemoveTextcolor', format);
  } else {
    onChoice(value);
    editor.execCommand('mceApplyTextcolor', format, value);
  }
};

const getFetch = (hasCustom: boolean) => (callback) => {
  callback(
    Settings.getCurrentColors().concat(getAdditionalColors(hasCustom))
  );
};

const registerTextColorButton = (editor, name: string, format: string, tooltip: string) => {
  editor.ui.registry.addSplitButton(name, (() => {
    const lastColour = Cell(null);
    return {
      type: 'splitbutton',
      tooltip,
      presets: 'color',
      icon: name === 'forecolor' ? 'text-color' : 'background-color',
      select: () => false,
      columns: getColorCols(editor),
      fetch: getFetch(Settings.hasCustomColors(editor)),
      onAction: (splitButtonApi) => {
        // do something with last colour
        if (lastColour.get() !== null) {
          applyColour(editor, format, splitButtonApi, lastColour.get(), () => { });
        }
      },
      onItemAction: (splitButtonApi, value) => {
        applyColour(editor, format, splitButtonApi, value, (newColour) => {

          const setIconFillAndStroke = (pathId, colour) => {
            splitButtonApi.setIconFill(pathId, colour);
            splitButtonApi.setIconStroke(pathId, colour);
          };

          lastColour.set(newColour);
          setIconFillAndStroke(name === 'forecolor' ? 'color' : 'Rectangle', newColour);
        });
      }
    } as Toolbar.ToolbarSplitButtonApi;
  })());
};

const colorPickerDialog = (editor) => (callback, value) => {
  const getOnSubmit = (callback) => {
    return (api) => {
      const data = api.getData();
      callback(data.colorpicker);
      api.close();
    };
  };

  const onAction = (api, details) => {
    if (details.name === 'hex-valid') {
      if (details.value) {
        api.enable('ok');
      } else {
        api.disable('ok');
      }
    }
  };

  const submit = getOnSubmit(callback);
  editor.windowManager.open({
    title: 'Color',
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
        type: 'submit',
        name: 'ok',
        text: 'Ok',
        primary: true
      },
      {
        type: 'cancel',
        name: 'cancel',
        text: 'Cancel',
      }
    ],
    initialData: {
      colorpicker: value
    },
    onAction,
    onSubmit: submit,
    onClose: () => {
      editor.focus();
    }
  });
};

const register = (editor) => {
  Settings.register(editor);
  registerCommands(editor);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Color');
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background Color');
};

export default { register, getFetch, colorPickerDialog, getCurrentColor, getColorCols, calcCols};