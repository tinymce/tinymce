/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { Attribute, Replication, SugarElement, SugarNode, Traverse } from '@ephox/sugar';
import { hasLastChildList, ListType } from './Util';

/*
General workflow: Parse lists to entries -> Manipulate entries -> Compose entries to lists

0-------1---2--------->Depth
  <ol>                |
    <li>a</li>        | Entry { depth: 1, content: [a], listType: ListType.OL, ... }
    <li>b             | Entry { depth: 1, content: [b], listType: ListType.OL, ... }
      <ul>            |
        <li>c</li>    | Entry { depth: 2, content: [c], listType: ListType.UL, ... }
      </ul>           |
    </li>             |
  </ol>               |
0-------1---2--------->Depth
*/

export interface Entry {
  depth: number;
  dirty: boolean;
  content: SugarElement[];
  isSelected: boolean;
  listType: ListType;
  listAttributes: Record<string, any>;
  itemAttributes: Record<string, any>;
}

const isIndented = (entry: Entry) => entry.depth > 0;

const isSelected = (entry: Entry) => entry.isSelected;

const cloneItemContent = (li: SugarElement): SugarElement[] => {
  const children = Traverse.children(li);
  const content = hasLastChildList(li) ? children.slice(0, -1) : children;
  return Arr.map(content, Replication.deep);
};

const createEntry = (li: SugarElement, depth: number, isSelected: boolean): Optional<Entry> => Traverse.parent(li).filter(SugarNode.isElement).map((list) => ({
  depth,
  dirty: false,
  isSelected,
  content: cloneItemContent(li),
  itemAttributes: Attribute.clone(li),
  listAttributes: Attribute.clone(list),
  listType: SugarNode.name(list) as ListType
}));

export {
  createEntry,
  isIndented,
  isSelected
};
