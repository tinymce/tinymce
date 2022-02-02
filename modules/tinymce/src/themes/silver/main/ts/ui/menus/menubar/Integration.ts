/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { getRemovedMenuItems } from 'tinymce/themes/silver/api/Settings';

import { MenubarItemSpec } from './SilverMenubar';

interface MenuSpec {
  readonly title: string;
  readonly items: string;
}

export interface MenuRegistry {
  menuItems: Record<string, any>;
  menubar: string | boolean;
  menus: Record<string, MenuSpec>;
}

const defaultMenubar = 'file edit view insert format tools table help';

const defaultMenus: Record<string, MenuSpec> = {
  file: { title: 'File', items: 'newdocument restoredraft | preview | export print | deleteallconversations' },
  edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
  view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
  insert: { title: 'Insert', items: 'image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
  format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | language | removeformat' },
  tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | a11ycheck code wordcount' },
  table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
  help: { title: 'Help', items: 'help' }
};

const make = (menu: {title: string; items: string[]}, registry: MenuRegistry, editor): MenubarItemSpec => {
  const removedMenuItems = getRemovedMenuItems(editor).split(/[ ,]/);
  return {
    text: menu.title,
    getItems: () => Arr.bind(menu.items, (i) => {
      const itemName = i.toLowerCase();
      if (itemName.trim().length === 0) {
        return [ ];
      } else if (Arr.exists(removedMenuItems, (removedMenuItem) => removedMenuItem === itemName)) {
        return [ ];
      } else if (itemName === 'separator' || itemName === '|') {
        return [{
          type: 'separator'
        }];
      } else if (registry.menuItems[itemName]) {
        return [ registry.menuItems[itemName] ];
      } else {
        return [ ];
      }
    })
  };
};

const parseItemsString = (items: string): string[] => {
  if (typeof items === 'string') {
    return items.split(' ');
  }
  return items;
};

const identifyMenus = (editor: Editor, registry: MenuRegistry): MenubarItemSpec[] => {
  const rawMenuData = { ...defaultMenus, ...registry.menus };
  const userDefinedMenus = Obj.keys(registry.menus).length > 0;

  const menubar: string[] = registry.menubar === undefined || registry.menubar === true ? parseItemsString(defaultMenubar) : parseItemsString(registry.menubar === false ? '' : registry.menubar);
  const validMenus = Arr.filter(menubar, (menuName) => {
    const isDefaultMenu = Obj.has(defaultMenus, menuName);
    if (userDefinedMenus) {
      return isDefaultMenu || Obj.get(registry.menus, menuName).exists((menu) => Obj.has(menu, 'items'));
    } else {
      return isDefaultMenu;
    }
  });

  const menus: MenubarItemSpec[] = Arr.map(validMenus, (menuName) => {
    const menuData = rawMenuData[menuName];
    return make({ title: menuData.title, items: parseItemsString(menuData.items) }, registry, editor);
  });

  return Arr.filter(menus, (menu) => {
    // Filter out menus that have no items, or only separators
    const isNotSeparator = (item) => item.type !== 'separator';
    return menu.getItems().length > 0 && Arr.exists(menu.getItems(), isNotSeparator);
  });
};

export { identifyMenus };
