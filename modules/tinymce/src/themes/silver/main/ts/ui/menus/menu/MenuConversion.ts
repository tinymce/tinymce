import { Menu } from '@ephox/bridge';
import { Arr, Id, Merger, Obj, Type } from '@ephox/katamari';

import { SingleMenuItemSpec } from './SingleMenuTypes';

interface ExpandedMenu {
  readonly menus: Record<string, SingleMenuItemSpec[]>;
  readonly expansions: Record<string, string>;
  readonly item: SingleMenuItemSpec;
}

export interface ExpandedMenus {
  readonly menus: Record<string, SingleMenuItemSpec[]>;
  readonly expansions: Record<string, string>;
  readonly items: SingleMenuItemSpec[];
}

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
  }, [] as SingleMenuItemSpec[]);

  // Remove any trailing separators
  if (realItems.length > 0 && isSeparator(realItems[realItems.length - 1])) {
    realItems.pop();
  }

  return realItems;
};

const getFromExpandingItem = (item: Menu.NestedMenuItemSpec & { value: string }, menuItems: MenuItemRegistry): ExpandedMenu => {
  const submenuItems = item.getSubmenuItems();
  const rest = expand(submenuItems, menuItems);

  const newMenus = Merger.deepMerge(
    rest.menus,
    { [item.value]: rest.items }
  );
  const newExpansions = Merger.deepMerge(
    rest.expansions,
    { [item.value]: item.value }
  );

  return {
    item,
    menus: newMenus,
    expansions: newExpansions
  };
};

const generateValueIfRequired = (item: Menu.NestedMenuItemSpec): Menu.NestedMenuItemSpec & { value: string } => {
  // Use the value already in item if it has one.
  const itemValue = Obj.get<any, string>(item, 'value').getOrThunk(() => Id.generate('generated-menu-item'));
  return Merger.deepMerge({ value: itemValue }, item);
};

// Takes items, and consolidates them into its return value
const expand = (items: string | Array<string | SingleMenuItemSpec>, menuItems: MenuItemRegistry): ExpandedMenus => {
  // Fistly, we do all substitution using the registry for any items referenced by their
  // string key.
  const realItems = unwrapReferences(Type.isString(items) ? items.split(' ') : items, menuItems);

  // Now that we have complete bridge Item specs for all items, we need to collect the
  // submenus, items in the primary menu, and triggering menu items all into one
  // giant object to from the building blocks on our TieredData
  return Arr.foldr(realItems, (acc, item) => {
    if (isExpandingMenuItem(item)) {
      // We generate a random value for item, but only if there isn't an existing value
      const itemWithValue = generateValueIfRequired(item);

      // The newData isn't quite in the format you might expect. The list of items
      // for an item with nested items is just the single parent item. All of the nested
      // items becomes part of '.menus'. Finally, the expansions is just a map from
      // the triggering item to the first submenu. Incidentally, they are given the same
      // value (triggering item and submenu), for convenience.
      const newData = getFromExpandingItem(itemWithValue, menuItems);
      return {
        // Combine all of our current submenus and items with the new submenus created by
        // this item with nested subitems
        menus: Merger.deepMerge(acc.menus, newData.menus),
        // Add our parent item into the list of items in the *current menu*.
        items: [ newData.item, ...acc.items ],
        // Merge together our "this item opens this submenu" objects
        expansions: Merger.deepMerge(acc.expansions, newData.expansions)
      };
    } else {
      // If we aren't creating any submenus, then all we need to do is add this item
      // to the list of items in the current menu. So this is the same as an expanding
      // menu item, except it doesn't add to `menus` or `expansions`.
      return {
        ...acc,
        items: [ item, ...acc.items ]
      };
    }
  }, {
    menus: { },
    expansions: { },
    items: [ ]
  } as ExpandedMenus);
};

export {
  expand,
  unwrapReferences
};
