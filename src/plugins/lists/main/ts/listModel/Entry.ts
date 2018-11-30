/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/sugar';
import { ListType } from './ListType';

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
  content: Element[];
  isSelected: boolean;
  listType: ListType;
  listAttributes: Record<string, any>;
  itemAttributes: Record<string, any>;
}

export const isIndented = (entry: Entry) => {
  return entry.depth > 0;
};

export const isSelected = (entry: Entry) => {
  return entry.isSelected;
};