/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Singleton, Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

interface Item {
  readonly value: string;
}

const onSetupToggle = (editor: Editor, formatName: string, active: () => boolean) => {
  return (api: Toolbar.ToolbarMenuButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();

    const init = () => {
      api.setActive(active());
      const binding = editor.formatter.formatChanged(formatName, api.setActive);
      boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

const onSetupToggleSingle = (editor: Editor, formatName: string, formatValue: string) =>
  onSetupToggle(editor, formatName, () => editor.formatter.match(formatName, { value: formatValue }));

const onSetupToggleInverse = (editor: Editor, formatName: string, formatValues: string[]) =>
  onSetupToggle(editor, formatName, () => !Arr.exists(formatValues, (value) => editor.formatter.match(formatName, { value })));

const applyTableCellStyle = <T extends Item>(editor: Editor, style: string) =>
  (item: T) =>
    editor.execCommand('mceTableApplyCellStyle', false, { [style]: item.value });

const filterNoneItem = <T extends Item>(list: T[]) =>
  Arr.filter(list, (item) => Strings.isNotEmpty(item.value));

const generateItem = <T extends Item>(editor: Editor, item: T, otherValues: Optional<string[]>, format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec => ({
  text: extractText(item),
  type: 'togglemenuitem',
  onAction: () => onAction(item),
  onSetup: otherValues.fold(
    () => onSetupToggleSingle(editor, format, item.value),
    (values) => onSetupToggleInverse(editor, format, values)
  )
});

const generateItems = <T extends Item>(editor: Editor, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec[] =>
  Arr.map(items, (item) => {
    if (Strings.isEmpty(item.value)) {
      const otherValues = Optional.some(Arr.map(filterNoneItem(items), (itemValue) => itemValue.value));
      return generateItem(editor, item, otherValues, format, extractText, onAction);
    } else {
      return generateItem(editor, item, Optional.none(), format, extractText, onAction);
    }
  });

const generateItemsCallback = <T extends Item>(editor: Editor, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void) =>
  (callback: (items: Menu.ToggleMenuItemSpec[]) => void) =>
    callback(generateItems(editor, items, format, extractText, onAction));

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
