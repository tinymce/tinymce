/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Singleton, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

interface ValueItem {
  readonly value: string;
}
interface Item extends ValueItem {
  readonly title: string;
}

const onSetupToggle = (editor: Editor, formatName: string, formatValue: string) => {
  return (api: Toolbar.ToolbarMenuButtonInstanceApi) => {
    const boundCallback = Singleton.unbindable();

    const init = () => {
      api.setActive(editor.formatter.match(formatName, { value: formatValue }));
      const binding = editor.formatter.formatChanged(formatName, api.setActive);
      boundCallback.set(binding);
    };

    // The editor may or may not have been setup yet, so check for that
    editor.initialized ? init() : editor.on('init', init);

    return boundCallback.clear;
  };
};

const filterNoneItem = <T extends ValueItem>(list: T[]) =>
  Arr.filter(list, (item) => Strings.isNotEmpty(item.value));

const generateItem = (editor: Editor, command: string, format: string, item: Item): Menu.ToggleMenuItemSpec => ({
  text: item.title,
  type: 'togglemenuitem',
  onAction: () => {
    editor.execCommand(command, false, item.value);
  },
  onSetup: onSetupToggle(editor, format, item.value)
});

const generateItems = (editor: Editor, command: string, format: string, items: Item[]): Menu.ToggleMenuItemSpec[] =>
  Arr.map(items, (item) => generateItem(editor, command, format, item));

const generateItemsCallback = (editor: Editor, command: string, format: string, items: Item[]) =>
  (callback: (items: Menu.ToggleMenuItemSpec[]) => void) => callback(generateItems(editor, command, format, items));

export {
  onSetupToggle,
  generateItems,
  generateItemsCallback,
  filterNoneItem
};
