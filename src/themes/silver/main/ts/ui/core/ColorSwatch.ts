import { Cell } from '@ephox/katamari';

import { Menu, Toolbar } from '@ephox/bridge';

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

const hasCustomColors = (editor) => {
  return editor.getParam('custom_colors') !== false;
};

const choiceItem: 'choiceitem' = 'choiceitem';

const defaultColors = [
  { type: choiceItem, text: 'Black', value: '#1abc9c' },
  { type: choiceItem, text: 'Black', value: '#2ecc71' },
  { type: choiceItem, text: 'Black', value: '#3498db' },
  { type: choiceItem, text: 'Black', value: '#9b59b6' },
  { type: choiceItem, text: 'Black', value: '#34495e' },

  { type: choiceItem, text: 'Black', value: '#16a085' },
  { type: choiceItem, text: 'Black', value: '#27ae60' },
  { type: choiceItem, text: 'Black', value: '#2980b9' },
  { type: choiceItem, text: 'Black', value: '#8e44ad' },
  { type: choiceItem, text: 'Black', value: '#2c3e50' },

  { type: choiceItem, text: 'Black', value: '#f1c40f' },
  { type: choiceItem, text: 'Black', value: '#e67e22' },
  { type: choiceItem, text: 'Black', value: '#e74c3c' },
  { type: choiceItem, text: 'Black', value: '#ecf0f1' },
  { type: choiceItem, text: 'Black', value: '#95a5a6' },

  { type: choiceItem, text: 'Black', value: '#f39c12' },
  { type: choiceItem, text: 'Black', value: '#d35400' },
  { type: choiceItem, text: 'Black', value: '#c0392b' },
  { type: choiceItem, text: 'Black', value: '#bdc3c7' },
  { type: choiceItem, text: 'Black', value: '#7f8c8d' },

  { type: choiceItem, text: 'Black', value: '#000000' },
  { type: choiceItem, text: 'Black', value: '#ffffff' }
];

const currentColors: Cell<Menu.ChoiceMenuItemApi[]> = Cell<Menu.ChoiceMenuItemApi[]>(
  defaultColors
);

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

const mapColors = function (colorMap) {
  let i;
  const colors = [];

  for (i = 0; i < colorMap.length; i += 2) {
    colors.push({
      text: colorMap[i + 1],
      value: '#' + colorMap[i],
      type: 'choiceitem'
    });
  }

  return colors;
};

const calcCols = (colors) => {
  return Math.ceil(Math.sqrt(colors));
};

const getColorCols = function (editor) {
  const colors = currentColors.get();
  const defaultCols = calcCols(colors.length);
  return editor.getParam('color_cols', defaultCols);
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
      addColor(color);
      editor.execCommand('mceApplyTextcolor', format, color);
      onChoice(color);
    }, '#ff00ff');
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
    currentColors.get().concat(getAdditionalColors(hasCustom))
  );
};

const addColor = (color) => {
  currentColors.set(currentColors.get().concat([
    {
      type: 'choiceitem',
      text: color,
      value: color
    }
  ]));
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
      fetch: getFetch(hasCustomColors(editor)), // TODO: Setting for this, maybe 'custom_colors'?
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
  const unmapped = editor.getParam('color_map');
  if (unmapped !== undefined) {
    currentColors.set(mapColors(unmapped));
  }
  registerCommands(editor);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Color');
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background Color');
};

export default { register, addColor, getFetch, colorPickerDialog, getCurrentColor, mapColors, getColorCols, calcCols, hasCustomColors };