/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

export interface Clipboard {
  getRows: () => Optional<SugarElement<HTMLTableRowElement>[]>;
  setRows: (rows: Optional<SugarElement<HTMLTableRowElement>[]>) => void;
  clearRows: () => void;

  getColumns: () => Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>;
  setColumns: (columns: Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>) => void;
  clearColumns: () => void;
}

export const Clipboard = (): Clipboard => {
  const rows = Cell(Optional.none<SugarElement<HTMLTableRowElement>[]>());
  const cols = Cell(Optional.none<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>());

  const clearClipboard = (clipboard: Cell<Optional<SugarElement<any>[]>>) => {
    clipboard.set(Optional.none());
  };

  return {
    getRows: rows.get,
    setRows: (r: Optional<SugarElement<HTMLTableRowElement>[]>) => {
      rows.set(r);
      clearClipboard(cols);
    },
    clearRows: () => clearClipboard(rows),
    getColumns: cols.get,
    setColumns: (c: Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>) => {
      cols.set(c);
      clearClipboard(rows);
    },
    clearColumns: () => clearClipboard(cols)
  };
};
