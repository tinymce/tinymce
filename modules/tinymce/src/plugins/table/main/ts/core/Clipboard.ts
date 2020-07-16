/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableRowElement } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface Clipboard {
  getRows: () => Option<SugarElement<HTMLTableRowElement>[]>;
  setRows: (rows: Option<SugarElement<HTMLTableRowElement>[]>) => void;
  clearRows: () => void;

  getColumns: () => Option<SugarElement<HTMLTableRowElement>[]>;
  setColumns: (columns: Option<SugarElement<HTMLTableRowElement>[]>) => void;
  clearColumns: () => void;
}

export const Clipboard = (): Clipboard => {
  const rows = Cell(Option.none<SugarElement<HTMLTableRowElement>[]>());
  const cols = Cell(Option.none<SugarElement<HTMLTableRowElement>[]>());

  const clearClipboard = (clipboard: Cell<Option<SugarElement<any>[]>>) => {
    clipboard.set(Option.none());
  };

  return {
    getRows: rows.get,
    setRows: (r: Option<SugarElement<HTMLTableRowElement>[]>) => {
      rows.set(r);
      clearClipboard(cols);
    },
    clearRows: () => clearClipboard(rows),
    getColumns: cols.get,
    setColumns: (c: Option<SugarElement<HTMLTableRowElement>[]>) => {
      cols.set(c);
      clearClipboard(rows);
    },
    clearColumns: () => clearClipboard(cols)
  };
};
