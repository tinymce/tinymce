/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableElement } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TableConversions, TableDirection, TableLookup } from '@ephox/snooker';
import { Attr, Css, Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Direction from '../queries/Direction';
import * as TableSize from '../queries/TableSize';

const enforcePercentage = (editor: Editor, table: Element<HTMLTableElement>) => {
  const direction = TableDirection(Direction.directionAt);
  const tableSizing = TableSize.get(editor, table);
  TableConversions.convertToPercentSize(table, direction, tableSizing);
};

const enforcePixels = (editor: Editor, table: Element<HTMLTableElement>) => {
  const direction = TableDirection(Direction.directionAt);
  const tableSizing = TableSize.get(editor, table);
  TableConversions.convertToPixelSize(table, direction, tableSizing);
};

const enforceNone = TableConversions.convertToNoneSize;

const syncPixels = (table: Element<HTMLTableElement>) => {
  // Ensure the specified width matches the actual cell width
  Arr.each(TableLookup.cells(table), (cell) => {
    const computedWidth = Css.get(cell, 'width');
    Css.set(cell, 'width', computedWidth);
    Attr.remove(cell, 'width');
  });
};

export {
  enforcePercentage,
  enforcePixels,
  enforceNone,
  syncPixels
};
