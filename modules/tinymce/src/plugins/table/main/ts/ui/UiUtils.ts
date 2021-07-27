/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selections } from '@ephox/darwin';
import { Arr, Singleton, Strings } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Util from '../core/Util';
import * as TableSelection from '../selection/TableSelection';

interface Item {
  readonly value: string;
}

const onSetupToggle = (editor: Editor, selections: Selections, formatName: string, formatValue: string) => {
  return (api: Toolbar.ToolbarMenuButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();
    const isNone = Strings.isEmpty(formatValue);

    const init = () => {
      const selectedCells = TableSelection.getCellsFromSelection(Util.getSelectionStart(editor), selections, Util.getIsRoot(editor));

      const checkNode = (cell: SugarElement<Element>) =>
        editor.formatter.match(formatName, { value: formatValue }, cell.dom, isNone);

      // If value is empty (A None-entry in the list), check if the format is not set at all. Otherwise, check if the format is set to the correct value.
      if (isNone) {
        api.setActive(!Arr.exists(selectedCells, checkNode));
      } else {
        api.setActive(Arr.forall(selectedCells, checkNode));
      }
      // TODO: TINY-7713: formatChanged doesn't currently handle formats with dynamic values so this will currently cause all items to show as active
      // const binding = editor.formatter.formatChanged(formatName, setActive, isNone);
      // boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

const applyTableCellStyle = <T extends Item>(editor: Editor, style: string) =>
  (item: T) =>
    editor.execCommand('mceTableApplyCellStyle', false, { [style]: item.value });

const filterNoneItem = <T extends Item>(list: T[]) =>
  Arr.filter(list, (item) => Strings.isNotEmpty(item.value));

const generateItem = <T extends Item>(editor: Editor, selections: Selections, item: T, format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec => ({
  text: extractText(item),
  type: 'togglemenuitem',
  onAction: () => onAction(item),
  onSetup: onSetupToggle(editor, selections, format, item.value)
});

const generateItems = <T extends Item>(editor: Editor, selections: Selections, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec[] =>
  Arr.map(items, (item) => generateItem(editor, selections, item, format, extractText, onAction));

const generateItemsCallback = <T extends Item>(editor: Editor, selections: Selections, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void) =>
  (callback: (items: Menu.ToggleMenuItemSpec[]) => void) =>
    callback(generateItems(editor, selections, items, format, extractText, onAction));

const fixColorValue = (value: string, setColor: (colorValue: string) => void) => {
  if (value === 'remove') {
    setColor('');
  } else {
    setColor(value);
  }
};

const generateColorSelector = (editor: Editor, colorList: Menu.ChoiceMenuItemSpec[], style: string): Menu.FancyMenuItemSpec[] => [{
  type: 'fancymenuitem',
  fancytype: 'colorswatch',
  initData: {
    colors: colorList.length > 0 ? colorList : undefined,
    allowCustomColors: false
  },
  onAction: (data) => {
    fixColorValue(data.value, (value) => {
      editor.execCommand('mceTableApplyCellStyle', false, { [style]: value });
    });
  }
}];

const changeRowHeader = (editor: Editor) => () => {
  const currentType = editor.queryCommandValue('mceTableRowType');
  const newType = currentType === 'header' ? 'body' : 'header';
  editor.execCommand('mceTableRowType', false, { type: newType });
};

const changeColumnHeader = (editor: Editor) => () => {
  const currentType = editor.queryCommandValue('mceTableColType');
  const newType = currentType === 'th' ? 'td' : 'th';
  editor.execCommand('mceTableColType', false, { type: newType });
};

export {
  onSetupToggle,
  generateItems,
  generateItemsCallback,
  filterNoneItem,
  generateColorSelector,
  changeRowHeader,
  changeColumnHeader,
  applyTableCellStyle
};
