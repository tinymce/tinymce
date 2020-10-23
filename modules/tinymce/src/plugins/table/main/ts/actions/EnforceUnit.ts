/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { TableConversions, TableLookup, Warehouse } from '@ephox/snooker';
import { Attribute, Css, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as TableSize from '../queries/TableSize';

const enforcePercentage = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
  const tableSizing = TableSize.get(editor, table);
  TableConversions.convertToPercentSize(table, tableSizing);
};

const enforcePixels = (editor: Editor, table: SugarElement<HTMLTableElement>) => {
  const tableSizing = TableSize.get(editor, table);
  TableConversions.convertToPixelSize(table, tableSizing);
};

const enforceNone = TableConversions.convertToNoneSize;

const syncPixels = (table: SugarElement<HTMLTableElement>) => {
  const warehouse = Warehouse.fromTable(table);
  if (!Warehouse.hasColumns(warehouse)) {
    // Ensure the specified width matches the actual cell width
    Arr.each(TableLookup.cells(table), (cell) => {
      const computedWidth = Css.get(cell, 'width');
      Css.set(cell, 'width', computedWidth);
      Attribute.remove(cell, 'width');
    });
  }
};

export { enforcePercentage, enforcePixels, enforceNone, syncPixels };

