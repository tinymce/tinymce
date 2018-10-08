import { Cell, Arr } from '@ephox/katamari';

import { Menu, Toolbar } from '@ephox/bridge';

const currentColors: Cell<Menu.ChoiceMenuItemApi[]> = Cell<Menu.ChoiceMenuItemApi[]>(
  []
);

const defaultColors = [
  { text: 'Black', value: '#1abc9c' },
  { text: 'Black', value: '#2ecc71' },
  { text: 'Black', value: '#3498db' },
  { text: 'Black', value: '#9b59b6' },
  { text: 'Black', value: '#34495e' },

  { text: 'Black', value: '#16a085' },
  { text: 'Black', value: '#27ae60' },
  { text: 'Black', value: '#2980b9' },
  { text: 'Black', value: '#8e44ad' },
  { text: 'Black', value: '#2c3e50' },

  { text: 'Black', value: '#f1c40f' },
  { text: 'Black', value: '#e67e22' },
  { text: 'Black', value: '#e74c3c' },
  { text: 'Black', value: '#ecf0f1' },
  { text: 'Black', value: '#95a5a6' },

  { text: 'Black', value: '#f39c12' },
  { text: 'Black', value: '#d35400' },
  { text: 'Black', value: '#c0392b' },
  { text: 'Black', value: '#bdc3c7' },
  { text: 'Black', value: '#7f8c8d' },

  { text: 'Black', value: '#000000' },
  { text: 'Black', value: '#ffffff' },
];

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

const getTextColorMap = function (editor): Menu.ChoiceMenuItemApi[] {
  const unmapped = editor.getParam('textcolor_map', defaultColors);
  return Arr.map(unmapped, (item): Menu.ChoiceMenuItemApi => {
    return {
      text: item.text,
      value: item.value,
      type: 'choiceitem'
    };
  });
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

const registerTextColorButton = (editor, name: string, format: string, tooltip: string, cols: number) => {
  editor.ui.registry.addSplitButton(name, (() => {
    const lastColour = Cell(null);
    return {
      type: 'splitbutton',
      tooltip,
      presets: 'color',
      icon: name === 'forecolor' ? 'text-color' : 'background-color',
      select: () => false,
      columns: cols,
      fetch: getFetch(true), // TODO: Setting for this, maybe 'custom_colors'?
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

const registerToolbarItems = (editor) => {
  currentColors.set(getTextColorMap(editor));
  registerCommands(editor);
  registerTextColorButton(editor, 'forecolor', 'forecolor', 'Color', 5);
  registerTextColorButton(editor, 'backcolor', 'hilitecolor', 'Background Color', 5);
};

export default { registerToolbarItems, addColor, getFetch, colorPickerDialog };