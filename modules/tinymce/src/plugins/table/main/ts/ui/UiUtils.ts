/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Singleton, Strings } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

interface Item {
  readonly value: string;
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

const filterNoneItem = <T extends Item>(list: T[]) =>
  Arr.filter(list, (item) => Strings.isNotEmpty(item.value));

const generateItem = <T extends Item>(editor: Editor, item: T, format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec => ({
  text: extractText(item),
  type: 'togglemenuitem',
  onAction: () => {
    onAction(item);
  },
  onSetup: onSetupToggle(editor, format, item.value)
});

const generateItems = <T extends Item>(editor: Editor, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void): Menu.ToggleMenuItemSpec[] =>
  Arr.map(items, (item) => generateItem(editor, item, format, extractText, onAction));

const generateItemsCallback = <T extends Item>(editor: Editor, items: T[], format: string, extractText: (item: T) => string, onAction: (item: T) => void) =>
  (callback: (items: Menu.ToggleMenuItemSpec[]) => void) =>
    callback(generateItems(editor, items, format, extractText, onAction));

export {
  onSetupToggle,
  generateItems,
  generateItemsCallback,
  filterNoneItem
};
