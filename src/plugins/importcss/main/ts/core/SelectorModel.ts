/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

const generate = () => {
  const ungroupedOrder = [ ];
  const groupOrder = [ ];

  const groups = { };

  const addItemToGroup = (groupTitle, itemInfo) => {
    if (groups[groupTitle]) {
      groups[groupTitle].push(itemInfo);
    } else {
      groupOrder.push(groupTitle);
      groups[groupTitle] = [ itemInfo ];
    }
  };

  const addItem = (itemInfo) => {
    ungroupedOrder.push(itemInfo);
  };

  const toFormats = () => {
    const groupItems = Arr.bind(groupOrder, (g) => {
      const items = groups[g];
      return items.length === 0 ? [ ] : [{
        title: g,
        items
      }];
    });

    return groupItems.concat(ungroupedOrder);
  };

  return {
    addItemToGroup,
    addItem,
    toFormats
  };
};

export {
  generate
};