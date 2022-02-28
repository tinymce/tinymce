import { Optional, Type } from '@ephox/katamari';

import { Dialog } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';

import { ListItem, UserListItem } from '../ui/DialogTypes';

type ListExtractor = (item: UserListItem) => string;

const getValue = (item: UserListItem): string =>
  Type.isString(item.value) ? item.value : '';

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

const sanitizeWith = (extracter: ListExtractor = getValue) => (list: UserListItem[] | undefined): Optional<ListItem[]> =>
  Optional.from(list).map((list) => sanitizeList(list, extracter));

const sanitize = (list: UserListItem[]): Optional<ListItem[]> =>
  sanitizeWith(getValue)(list);

// NOTE: May need to care about flattening.
const createUi = (name: string, label: string) => (items: ListItem[]): Dialog.ListBoxSpec => ({
  name,
  type: 'listbox',
  label,
  items
});

export const ListOptions = {
  sanitize,
  sanitizeWith,
  createUi,
  getValue
};
