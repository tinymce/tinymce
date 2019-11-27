/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Objects } from '@ephox/boulder';
import { Menu } from '@ephox/bridge';
import { Arr, Obj, Id, Merger, Type } from '@ephox/katamari';

import { SingleMenuItemApi } from './SingleMenuTypes';

type MenuItemRegistry = Record<string, Menu.MenuItemApi | Menu.NestedMenuItemApi | Menu.ToggleMenuItemApi>;

const isMenuItemReference = (item: string | SingleMenuItemApi): item is string => Type.isString(item);
const isSeparator = (item: SingleMenuItemApi): item is Menu.SeparatorMenuItemApi => item.type === 'separator';
const isExpandingMenuItem = (item: SingleMenuItemApi): item is Menu.NestedMenuItemApi => {
  return Obj.has(item as Record<string, any>, 'getSubmenuItems');
};

const separator: Menu.SeparatorMenuItemApi = {
  type: 'separator'
};

const unwrapReferences = (items: Array<string | SingleMenuItemApi>, menuItems: MenuItemRegistry): SingleMenuItemApi[] => {
  // Unwrap any string based menu item references
  const realItems = Arr.foldl(items, (acc, item) => {
    if (isMenuItemReference(item)) {
      if (item === '') {
        return acc;
      } else if (item === '|') {
        // Ignore the separator if it's at the start or a duplicate
        return acc.length > 0 && !isSeparator(acc[acc.length - 1]) ? acc.concat([separator]) : acc;
      } else if (Obj.has(menuItems, item.toLowerCase())) {
        return acc.concat([ menuItems[item.toLowerCase()] ]);
      } else {
        // TODO: Add back after TINY-3232 is implemented
        // console.error('No representation for menuItem: ' + item);
        return acc;
      }
    } else {
      return acc.concat([ item ]);
    }
  }, []);

  // Remove any trailing separators
  if (realItems.length > 0 && isSeparator(realItems[realItems.length - 1])) {
    realItems.pop();
  }

  return realItems;
};

const getFromExpandingItem = (item: Menu.NestedMenuItemApi, menuItems: MenuItemRegistry) => {
  const submenuItems = item.getSubmenuItems();
  const rest = expand(submenuItems, menuItems);

  const newMenus = Merger.deepMerge(
    rest.menus,
    Objects.wrap(
      item.value,
      rest.items
    )
  );
  const newExpansions = Merger.deepMerge(
    rest.expansions,
    Objects.wrap(item.value, item.value)
  );

  return {
    item,
    menus: newMenus,
    expansions: newExpansions
  };
};

const getFromItem = (item: SingleMenuItemApi, menuItems: MenuItemRegistry) => {
  return isExpandingMenuItem(item) ? getFromExpandingItem(item, menuItems) : {
    item,
    menus: { },
    expansions: { }
  };
};

const generateValueIfRequired = (item: SingleMenuItemApi): SingleMenuItemApi => {
  // Separators don't have a value, so just return the item
  if (isSeparator(item)) {
    return item;
  } else {
    // Use the value already in item if it has one.
    const itemValue = Obj.get<any, string>(item, 'value').getOrThunk(() => Id.generate('generated-menu-item'));
    return Merger.deepMerge({ value: itemValue }, item);
  }
};

// Takes items, and consolidates them into its return value
const expand = (items: string | Array<string | SingleMenuItemApi>, menuItems: MenuItemRegistry) => {
  const realItems = unwrapReferences(Type.isString(items) ? items.split(' ') : items, menuItems);
  return Arr.foldr(realItems, (acc, item) => {
    const itemWithValue = generateValueIfRequired(item);
    const newData = getFromItem(itemWithValue, menuItems);
    return {
      menus: Merger.deepMerge(acc.menus, newData.menus),
      items: [ newData.item ].concat(acc.items),
      expansions: Merger.deepMerge(acc.expansions, newData.expansions)
    };
  }, {
    menus: { },
    expansions: { },
    items: [ ]
  });
};

export {
  expand,
  unwrapReferences
};
