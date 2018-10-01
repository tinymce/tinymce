import { Menu, Toolbar } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import Settings from '../api/Settings';

/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getIcon = (color: string) => {
  if (color === 'remove') {
    return '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M25 5L5 25" stroke-width="1.5" fill="none"></path></svg>';
  } else if (color === 'custom') {
    return 'color-picker';
  } else {
    return `<div style="width: 24px; height: 24px; background-color: ${color};"></div>`;
  }
};

const currentColors: Cell<Menu.ChoiceMenuItemApi[]> = Cell<Menu.ChoiceMenuItemApi[]>(
  []
);

const applyColour = function (editor, format, splitButtonApi, value, onChoice: (v: string) => void) {
  if (value === 'custom') {
    editor.windowManager.open({
      title: 'Colorpicker',
      body: {
        type: 'panel',
        items: [
          { type: 'colorpicker', name: 'col' }
        ]
      },
      buttons: [
        {
          type: 'submit',
          text: 'OK',
          primary: true
        },
        {
          type: 'cancel',
          text: 'Cancel'
        }
      ],
      initialData: {
        col: '#eeeeee'
      },
      onSubmit: (dialogApi) => {
        const data = dialogApi.getData().col;

        currentColors.set(currentColors.get().concat([
          {
            type: 'choiceitem',
            text: data,
            icon: getIcon(data),
            value: data
          }
        ]));

        dialogApi.close();
        editor.execCommand('mceApplyTextcolor', format, data);
        onChoice(data);
      }
    });
  } else if (value === 'remove') {
    editor.execCommand('mceRemoveTextcolor', format);
  } else  {
    onChoice(value);
    editor.execCommand('mceApplyTextcolor', format, value);
  }
};

const register = function (editor) {
  currentColors.set(Settings.getTextColorMap(editor));

  const addColorButton = (name: string, format: string, tooltip: string, cols: number) => {
    editor.ui.registry.addSplitButton(name, (() => {
      const lastColour = Cell(null);
      return {
        type: 'splitbutton',
        tooltip,
        presets: 'color',
        icon: name === 'forecolor' ? 'text-color' : 'background-color',
        select: () => false,
        columns: cols,
        fetch: (callback) => {
          callback(
            currentColors.get().concat([
              {
                type: 'choiceitem',
                text: 'Remove',
                icon: getIcon('remove'),
                value: 'remove'
              },
              {
                type: 'choiceitem',
                text: 'Custom',
                icon: getIcon('custom'),
                value: 'custom'
              }
            ])
          );
        },
        onAction: (splitButtonApi) => {
          // do something with last colour
          if (lastColour.get() !== null) {
            applyColour(editor,  format, splitButtonApi, lastColour.get(), () => { });
          }
        },
        onItemAction : (splitButtonApi, value) => {
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

  addColorButton('forecolor', 'forecolor', 'Color', Settings.getForeColorCols(editor));
  addColorButton('backcolor', 'hilitecolor', 'Background Color', Settings.getBackColorCols(editor));
};

export default {
  register
};