/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Objects } from '@ephox/boulder';
import { Arr, Merger, Obj } from '@ephox/katamari';

const getFromExpandingItem = (item) => {
  const newItem = Merger.deepMerge(
    Objects.exclude(item, [ 'items' ]),
    {
      menu: true
    }
  );

  const rest = expand(item.items);

  const newMenus = Merger.deepMerge(
    rest.menus,
    Objects.wrap(
      item.title,
      rest.items
    )
  );
  const newExpansions = Merger.deepMerge(
    rest.expansions,
    Objects.wrap(item.title, item.title)
  );

  return {
    item: newItem,
    menus: newMenus,
    expansions: newExpansions
  };
};

const getFromItem = (item) => {
  return Obj.hasNonNullableKey(item, 'items') ? getFromExpandingItem(item) : {
    item,
    menus: { },
    expansions: { }
  };
};

// Takes items, and consolidates them into its return value
const expand = (items) => {
  return Arr.foldr(items, (acc, item) => {
    const newData = getFromItem(item);
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
