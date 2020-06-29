/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableElement } from '@ephox/dom-globals';
import { Sizes, TableSize } from '@ephox/snooker';
import { Element, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { isPercentagesForced, isPixelsForced } from '../api/Settings';
import * as Util from '../core/Util';

export const get = (editor: Editor, table: Element<HTMLTableElement>) => {
  // Note: We can't enforce none (responsive), as if someone manually resizes a table
  // then it must switch to either pixel (fixed) or percentage (relative) sizing
  if (isPercentagesForced(editor)) {
    const width = Util.getRawWidth(editor, table.dom())
      .filter(Util.isPercentage)
      .getOrThunk(() => Sizes.getPercentTableWidth(table));
    return TableSize.percentageSize(width, table);
  } else if (isPixelsForced(editor)) {
    return TableSize.pixelSize(Width.get(table), table);
  } else {
    // Detect based on the table width
    return TableSize.getTableSize(table);
  }
};
