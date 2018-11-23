/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';

const createCustomMenuItems = function (editor, names) {
  let items, nameList;

  if (typeof names === 'string') {
    nameList = names.split(' ');
  } else if (Tools.isArray(names)) {
    return Arr.flatten(Tools.map(names, function (names) {
      return createCustomMenuItems(editor, names);
    }));
  }

  items = Tools.grep(nameList, function (name) {
    return name === '|' || name in editor.menuItems;
  });

  return Tools.map(items, function (name) {
    return name === '|' ? { text: '-' } : editor.menuItems[name];
  });
};

const isSeparator = function (menuItem) {
  return menuItem && menuItem.text === '-';
};

const trimMenuItems = function (menuItems) {
  const menuItems2 = Arr.filter(menuItems, function (menuItem, i, menuItems) {
    return !isSeparator(menuItem) || !isSeparator(menuItems[i - 1]);
  });

  return Arr.filter(menuItems2, function (menuItem, i, menuItems) {
    return !isSeparator(menuItem) || i > 0 && i < menuItems.length - 1;
  });
};

const createContextMenuItems = function (editor, context) {
  const outputMenuItems = [{ text: '-' }];
  const menuItems = Tools.grep(editor.menuItems, function (menuItem) {
    return menuItem.context === context;
  });

  Tools.each(menuItems, function (menuItem) {
    if (menuItem.separator === 'before') {
      outputMenuItems.push({ text: '|' });
    }

    if (menuItem.prependToContext) {
      outputMenuItems.unshift(menuItem);
    } else {
      outputMenuItems.push(menuItem);
    }

    if (menuItem.separator === 'after') {
      outputMenuItems.push({ text: '|' });
    }
  });

  return outputMenuItems;
};

const createInsertMenu = function (editor) {
  const insertButtonItems = editor.settings.insert_button_items;

  if (insertButtonItems) {
    return trimMenuItems(createCustomMenuItems(editor, insertButtonItems));
  } else {
    return trimMenuItems(createContextMenuItems(editor, 'insert'));
  }
};

const registerButtons = function (editor) {
  editor.addButton('insert', {
    type: 'menubutton',
    icon: 'insert',
    menu: [],
    oncreatemenu () {
      this.menu.add(createInsertMenu(editor));
      this.menu.renderNew();
    }
  });
};

const register = function (editor) {
  registerButtons(editor);
};

export default {
  register
};