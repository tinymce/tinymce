/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableElement } from '@ephox/dom-globals';
import { TableSize } from '@ephox/snooker';
import { Element, Traverse, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { calculatePercentageWidth } from '../actions/EnforceUnit';
import { isPercentagesForced, isPixelsForced } from '../api/Settings';
import * as Util from '../core/Util';

export const get = (editor: Editor, table: Element<HTMLTableElement>) => {
  // Note: We can't enforce none (responsive), as if someone manually resizes a table
  // then it must switch to either pixel (fixed) or percentage (relative) sizing
  if (isPercentagesForced(editor)) {
    return Util.getRawWidth(editor, table.dom())
      .filter(Util.isPercentage)
      .orThunk(() => Traverse.offsetParent(table).map((parent) => calculatePercentageWidth(table, parent)))
      .fold(
        // If the table isn't attached then we can't do relative sizing, so fallback to the current sizing mode
        () => TableSize.getTableSize(table),
        (width) => TableSize.percentageSize(width, table)
      );
  } else if (isPixelsForced(editor)) {
    return TableSize.pixelSize(Width.get(table));
  } else {
    // Detect based on the table width
    return TableSize.getTableSize(table);
  }
};
