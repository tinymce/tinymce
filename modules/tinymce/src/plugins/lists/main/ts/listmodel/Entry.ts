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

export type Entry = EntryList | EntryNoList | EntryComment;

export interface EntryList {
  depth: number;
  dirty: boolean;
  content: SugarElement<Node>[];
  isSelected: boolean;
  listType: ListType;
  listAttributes: Record<string, any>;
  itemAttributes: Record<string, any>;
}

export interface EntryNoList {
  depth: number;
  dirty: boolean;
  content: SugarElement<Node>[];
  isSelected: boolean;
  type: string;
  attributes: Record<string, any>;
  isInPreviousLi: boolean;
}

export interface EntryComment {
  depth: number;
  content: string;
  dirty: boolean;
  isSelected: boolean;
  isComment: true;
}

const isEntryList = (entry: Entry): entry is EntryList => 'listAttributes' in entry;

const isEntryNoList = (entry: Entry): entry is EntryNoList => 'isInPreviousLi' in entry;

const isEntryComment = (entry: Entry): entry is EntryComment => 'isComment' in entry;

const isIndented = (entry: Entry): boolean => entry.depth > 0;

const isSelected = (entry: Entry): boolean => entry.isSelected;

const cloneItemContent = (li: SugarElement<HTMLElement>): SugarElement<Node>[] => {
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
  listType: SugarNode.name(list) as ListType,
  isInPreviousLi: false
}));

export {
  createEntry,
  isEntryComment,
  isEntryList,
  isEntryNoList,
  isIndented,
  isSelected
};
