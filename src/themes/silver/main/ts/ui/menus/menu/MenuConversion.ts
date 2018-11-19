import { Objects } from '@ephox/boulder';
import { Menu } from '@ephox/bridge';
import { Arr, Obj, Id, Merger } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../../backstage/Backstage';
import { SingleMenuItemApi } from './SingleMenu';

const isMenuItemsReference = (items: string | SingleMenuItemApi[]): items is string => {
  return typeof items === 'string';
};

const unwrapReference = (items: string, providersBackstage: UiFactoryBackstageProviders): SingleMenuItemApi[] => {
  return Arr.bind(items.split(' '), (itemName) => {
    if (itemName === '|') {
      return [{ type: 'separator' }];
    } else {
      return Obj.get(providersBackstage.menuItems(), itemName.toLowerCase()).fold(
        () => {
          console.error('No representation for menuItem: ' + itemName);
          return [];
        },
        (item) => {
          return [ item ];
        }
      );
    }
  });
};

const isExpandingMenuItem = (item: SingleMenuItemApi): item is Menu.MenuItemApi => {
  return Obj.has(item as Record<string, any>, 'getSubmenuItems');
};

const getFromExpandingItem = (item: Menu.MenuItemApi, providersBackstage: UiFactoryBackstageProviders) => {
  const submenuItems = item.getSubmenuItems();
  const rest = expand(submenuItems, providersBackstage);

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

const getFromItem = (item: SingleMenuItemApi, providersBackstage: UiFactoryBackstageProviders) => {
  return isExpandingMenuItem(item) ? getFromExpandingItem(item, providersBackstage) : {
    item,
    menus: { },
    expansions: { }
  };
};

// Takes items, and consolidates them into its return value
const expand = (items: string | SingleMenuItemApi[], providersBackstage: UiFactoryBackstageProviders) => {
  const realItems = isMenuItemsReference(items) ? unwrapReference(items, providersBackstage) : items;
  return Arr.foldr(realItems, (acc, item) => {
    // Use the value already in item if it has one.
    const itemValue = Objects.readOptFrom(item, 'value').getOrThunk(() => Id.generate('generated-menu-item'));
    const itemWithValue = Merger.deepMerge({ value: itemValue }, item);
    const newData = getFromItem(itemWithValue, providersBackstage);
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
  expand
};