/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Type } from '@ephox/katamari';
import Tools from 'tinymce/core/api/util/Tools';
import { ListItem } from '../ui/DialogTypes';
import { Types } from '@ephox/bridge';

const getValue = (item): string => Type.isString(item.value) ? item.value : '';

const sanitizeList = (list, extractValue: (item) => string): ListItem[] => {
  const out: ListItem[] = [];
  Tools.each(list, function (item) {
    const text: string = Type.isString(item.text) ? item.text : Type.isString(item.title) ? item.title : '';
    if (item.menu !== undefined) {
      // TODO TINY-2236 re-enable this (support will need to be added to bridge)
      /*
      const items = sanitizeList(item.menu, extractValue);
      out.push({ text, items }); // list group
      */
    } else {
      const value = extractValue(item);
      out.push({ text, value }); // list value
    }
  });
  return out;
};

const sanitizeWith = (extracter: (item: any) => string = getValue) => (list: any[]): Option<ListItem[]> => Option.from(list).map((list) => sanitizeList(list, extracter));

const sanitize = (list: any[]): Option<ListItem[]> => sanitizeWith(getValue)(list);

// NOTE: May need to care about flattening.
const createUi = (name: string, label: string) => (items: ListItem[]): Types.Dialog.BodyComponentApi => ({
  name,
  type: 'selectbox',
  label,
  items
});

export const ListOptions = {
  sanitize,
  sanitizeWith,
  createUi,
  getValue
};