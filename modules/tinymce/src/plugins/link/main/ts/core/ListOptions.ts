/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Type } from '@ephox/katamari';
import { Dialog } from 'tinymce/core/api/ui/Ui';
import Tools from 'tinymce/core/api/util/Tools';
import { ListItem, UserListItem } from '../ui/DialogTypes';

const getValue = (item): string => Type.isString(item.value) ? item.value : '';

const sanitizeList = (list: UserListItem[], extractValue: (item) => string): ListItem[] => {
  const out: ListItem[] = [];
  Tools.each(list, (item) => {
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

const sanitizeWith = (extracter: (item: any) => string = getValue) => (list: UserListItem[]): Optional<ListItem[]> =>
  Optional.from(list).map((list) => sanitizeList(list, extracter));

const sanitize = (list: UserListItem[]): Optional<ListItem[]> => sanitizeWith(getValue)(list);

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
