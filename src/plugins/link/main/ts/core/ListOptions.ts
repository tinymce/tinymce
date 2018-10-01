import { Option, Type } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import { ListItem } from '../ui/DialogTypes';

const getValue = (item): string => Type.isString(item.value) ? item.value : '';

const sanitizeList = (list, extractValue: (item) => string): ListItem[] => {
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

const sanitizeWith = (extracter: (item: any) => string = getValue) => (list: any[]): Option<ListItem[]> => {
  return Option.from(list).map((list) => sanitizeList(list, extracter));
};

const sanitize = (list: any[]): Option<ListItem[]> => {
  return sanitizeWith(getValue)(list);
};

// NOTE: May need to care about flattening.
const createUi = (name: string, label: string) => (items: ListItem[]) => {
  return {
    name,
    type: 'selectbox',
    label,
    items
  };
};

export const ListOptions = {
  sanitize,
  sanitizeWith,
  createUi,
  getValue
};