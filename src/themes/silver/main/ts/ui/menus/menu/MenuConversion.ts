import { Objects } from '@ephox/boulder';
import { Arr, Id, Merger } from '@ephox/katamari';

const getFromExpandingItem = function (item) {
  const submenuItems = item.getSubmenuItems();
  const rest = expand(submenuItems);

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

const getFromItem = function (item) {
  return Objects.hasKey(item, 'getSubmenuItems') ? getFromExpandingItem(item) : {
    item,
    menus: { },
    expansions: { }
  };
};

// Takes items, and consolidates them into its return value
const expand = (items) => {
  return Arr.foldr(items, function (acc, item) {
    // Use the value already in item if it has one.
    const itemValue = Objects.readOptFrom(item, 'value').getOrThunk(() => Id.generate('generated-menu-item'));
    const itemWithValue = Merger.deepMerge({ value: itemValue }, item);
    const newData = getFromItem(itemWithValue);
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