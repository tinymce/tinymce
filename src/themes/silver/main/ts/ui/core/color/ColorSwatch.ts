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

const choiceItem: 'choiceitem' = 'choiceitem';

const defaultColors = [
  { type: choiceItem, text: 'TURQUOISE OR AQUA', value: '#18BC9B' },
  { type: choiceItem, text: 'BOLD GREEN OR GREEN', value: '#2FCC71' },
  { type: choiceItem, text: 'BLUE', value: '#3598DB' },
  { type: choiceItem, text: 'PURPLE', value: '#9B59B6' },
  { type: choiceItem, text: 'NAVY BLUE', value: '#34495E' },

  { type: choiceItem, text: 'DARK TURQUOISE OR DARK AQUA', value: '#18A085' },
  { type: choiceItem, text: 'DARK GREEN', value: '#27AE60' },
  { type: choiceItem, text: 'MEDIUM BLUE', value: '#2880B9' },
  { type: choiceItem, text: 'MEDIUM PURPLE', value: '#8E44AD' },
  { type: choiceItem, text: 'MIDNIGHT BLUE OR DARK NAVY BLUE', value: '#2B3E50' },

  { type: choiceItem, text: 'YELLOW', value: '#F1C40F' },
  { type: choiceItem, text: 'ORANGE', value: '#E67E23' },
  { type: choiceItem, text: 'RED', value: '#E74C3C' },
  { type: choiceItem, text: 'LIGHT GRAY', value: '#ECF0F1' },
  { type: choiceItem, text: 'GRAY', value: '#95A5A6' },

  { type: choiceItem, text: 'DARK YELLOW', value: '#F29D12' },
  { type: choiceItem, text: 'DARK ORANGE', value: '#E67E23' },
  { type: choiceItem, text: 'DARK RED', value: '#E74C3C' },
  { type: choiceItem, text: 'MEDIUM GRAY', value: '#BDC3C7' },
  { type: choiceItem, text: 'DARK GRAY', value: '#7E8C8D' },

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
      addColor(color);
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
      fetch: getFetch(Settings.hasCustomColors(editor)), // TODO: Setting for this, maybe 'custom_colors'?
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
  const unmapped = Settings.getColorMap(editor);
  if (unmapped !== undefined) {
    currentColors.set(mapColors(unmapped));
  }
  registerCommands(editor);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Color');
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background Color');
};

export default { register, addColor, getFetch, colorPickerDialog, getCurrentColor, mapColors, getColorCols, calcCols };