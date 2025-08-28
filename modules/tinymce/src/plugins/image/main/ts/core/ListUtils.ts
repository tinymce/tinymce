import { Arr, Obj, Optional, Type } from '@ephox/katamari';

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

const sanitizer = (extractor: ListExtractor = getValue) => (list: UserListItem[] | undefined | false): Optional<ListItem[]> => {
  if (list) {
    return Optional.from(list).map((list) => sanitizeList(list, extractor));
  } else {
    return Optional.none();
  }
};

const sanitize = (list: UserListItem[] | undefined): Optional<ListItem[]> =>
  sanitizer(getValue)(list);

const isGroup = (item: ListItem): item is ListGroup =>
  Obj.has(item as ListGroup, 'items');

const findEntryDelegate = (list: ListItem[], value: string): Optional<ListValue> =>
  Arr.findMap(list, (item) => {
    if (isGroup(item)) {
      return findEntryDelegate(item.items, value);
    } else if (item.value === value) {
      return Optional.some(item);
    } else {
      return Optional.none();
    }
  });

const findEntry = (optList: Optional<ListItem[]>, value: string): Optional<ListValue> =>
  optList.bind((list) => findEntryDelegate(list, value));

export const ListUtils = {
  sanitizer,
  sanitize,
  findEntry
};
