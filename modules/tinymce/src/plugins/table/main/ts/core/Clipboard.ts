/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

export interface Clipboard {
  getRows: () => Option<Element<HTMLTableRowElement>[]>;
  setRows: (rows: Option<Element<HTMLTableRowElement>[]>) => void;
  clearRows: () => void;

  getColumns: () => Option<Element<HTMLTableRowElement>[]>;
  setColumns: (columns: Option<Element<HTMLTableRowElement>[]>) => void;
  clearColumns: () => void;
}

export const Clipboard = (): Clipboard => {
  const rows = Cell(Option.none<Element<HTMLTableRowElement>[]>());
  const cols = Cell(Option.none<Element<HTMLTableRowElement>[]>());

  const clearClipboard = (clipboard: Cell<Option<Element<any>[]>>) => {
    clipboard.set(Option.none());
  };

  return {
    getRows: rows.get,
    setRows: (r: Option<Element<HTMLTableRowElement>[]>) => {
      rows.set(r);
      clearClipboard(cols);
    },
    clearRows: () => clearClipboard(rows),
    getColumns: cols.get,
    setColumns: (c: Option<Element<HTMLTableRowElement>[]>) => {
      cols.set(c);
      clearClipboard(rows);
    },
    clearColumns: () => clearClipboard(cols)
  };
};
