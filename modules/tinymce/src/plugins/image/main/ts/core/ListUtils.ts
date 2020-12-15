/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Type } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import { ListGroup, ListItem, ListValue, UserListItem } from '../ui/DialogTypes';

export type ListExtractor = (item: UserListItem) => string;

const getValue: ListExtractor = (item) => Type.isString(item.value) ? item.value : '';

const getText = (item: UserListItem): string => {
  if (Type.isString(item.text)) {
    return item.text;
  } else if (Type.isString(item.title)) {
    return item.title;
  } else {
    return '';
  }
};

const sanitizeList = (list: UserListItem[], extractValue: ListExtractor): ListItem[] => {
  const out: ListItem[] = [];
  Tools.each(list, (item) => {
    const text = getText(item);
    if (item.menu !== undefined) {
      const items = sanitizeList(item.menu, extractValue);
      out.push({ text, items }); // list group
    } else {
      const value = extractValue(item);
      out.push({ text, value }); // list value
    }
  });
  return out;
};

const sanitizer = (extracter = getValue) => (list: UserListItem[]): Optional<ListItem[]> => {
  if (list) {
    return Optional.from(list).map((list) => sanitizeList(list, extracter));
  } else {
    return Optional.none();
  }
};

const sanitize = (list: UserListItem[]) => sanitizer(getValue)(list);

const isGroup = (item: ListItem): item is ListGroup => Object.prototype.hasOwnProperty.call(item, 'items');

const findEntryDelegate = (list: ListItem[], value: string): Optional<ListValue> => Arr.findMap(list, (item) => {
  if (isGroup(item)) {
    return findEntryDelegate(item.items, value);
  } else if (item.value === value) {
    return Optional.some(item);
  } else {
    return Optional.none();
  }
});

const findEntry = (optList: Optional<ListItem[]>, value: string) =>
  optList.bind((list) => findEntryDelegate(list, value));

export const ListUtils = {
  sanitizer,
  sanitize,
  findEntry
};
