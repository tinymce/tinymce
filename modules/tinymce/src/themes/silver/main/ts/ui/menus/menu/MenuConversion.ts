import { Objects } from '@ephox/boulder';
import { Menu } from '@ephox/bridge';
import { Arr, Id, Merger, Obj, Type } from '@ephox/katamari';

import { SingleMenuItemSpec } from './SingleMenuTypes';

type MenuItemRegistry = Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;

const isMenuItemReference = (item: string | SingleMenuItemSpec): item is string => Type.isString(item);
const isSeparator = (item: SingleMenuItemSpec): item is Menu.SeparatorMenuItemSpec => item.type === 'separator';
const isExpandingMenuItem = (item: SingleMenuItemSpec): item is Menu.NestedMenuItemSpec => Obj.has(item as Record<string, any>, 'getSubmenuItems');

const separator: Menu.SeparatorMenuItemSpec = {
  type: 'separator'
};

const unwrapReferences = (items: Array<string | SingleMenuItemSpec>, menuItems: MenuItemRegistry): SingleMenuItemSpec[] => {
  // Unwrap any string based menu item references
  const realItems = Arr.foldl(items, (acc, item) => {
    if (isMenuItemReference(item)) {
      if (item === '') {
        return acc;
      } else if (item === '|') {
        // Ignore the separator if it's at the start or a duplicate
        return acc.length > 0 && !isSeparator(acc[acc.length - 1]) ? acc.concat([ separator ]) : acc;
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

const getFromExpandingItem = (item: Menu.NestedMenuItemSpec, menuItems: MenuItemRegistry) => {
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

const getFromItem = (item: SingleMenuItemSpec, menuItems: MenuItemRegistry) => isExpandingMenuItem(item) ? getFromExpandingItem(item, menuItems) : {
  item,
  menus: { },
  expansions: { }
};

const generateValueIfRequired = (item: SingleMenuItemSpec): SingleMenuItemSpec => {
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
const expand = (items: string | Array<string | SingleMenuItemSpec>, menuItems: MenuItemRegistry) => {
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
