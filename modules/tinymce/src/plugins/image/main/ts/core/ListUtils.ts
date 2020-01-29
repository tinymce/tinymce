/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option, Type } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import { ListItem, ListGroup, ListValue } from '../ui/DialogTypes';

export type ListExtractor = (item: any) => string;

const getValue: ListExtractor = (item) => Type.isString(item.value) ? item.value : '';

const sanitizeList = (list: any, extractValue: ListExtractor): ListItem[] => {
  const out: ListItem[] = [];
  Tools.each(list, function (item) {
    const text: string = Type.isString(item.text) ? item.text : Type.isString(item.title) ? item.title : '';
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

const sanitizer = (extracter = getValue) => (list: any): Option<ListItem[]> => {
  if (list) {
    return Option.from(list).map((list) => sanitizeList(list, extracter));
  } else {
    return Option.none();
  }
};

const sanitize = (list: any) => {
  return sanitizer(getValue)(list);
};

const isGroup = (item: ListItem): item is ListGroup => {
  return Object.prototype.hasOwnProperty.call(item, 'items');
};

const findEntryDelegate = (list: ListItem[], value: string): Option<ListValue> => {
  return Arr.findMap(list, (item) => {
    if (isGroup(item)) {
      return findEntryDelegate(item.items, value);
    } else if (item.value === value) {
      return Option.some(item);
    } else {
      return Option.none();
    }
  });
};

const findEntry = (optList: Option<ListItem[]>, value: string) =>
  optList.bind((list) => findEntryDelegate(list, value));

export const ListUtils = {
  sanitizer,
  sanitize,
  findEntry
};
