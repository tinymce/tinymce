/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional, Singleton } from '@ephox/katamari';
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
  const rows = Singleton.value<SugarElement<HTMLTableRowElement>[]>();
  const cols = Singleton.value<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>();

  return {
    getRows: rows.get,
    setRows: (r: Optional<SugarElement<HTMLTableRowElement>[]>) => {
      r.fold(rows.clear, rows.set);
      cols.clear();
    },
    clearRows: rows.clear,
    getColumns: cols.get,
    setColumns: (c: Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>) => {
      c.fold(cols.clear, cols.set);
      rows.clear();
    },
    clearColumns: cols.clear
  };
};
