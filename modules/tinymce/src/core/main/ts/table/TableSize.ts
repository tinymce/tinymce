/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/*
 NOTE: This file is duplicated in the following locations:
  - models/dom/table/queries/TableSize.ts
 Make sure that if making changes to this file, the other files are updated as well
 */

import { TableSize } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import { isTablePercentagesForced, isTablePixelsForced } from '../api/Options';

export const get = (editor: Editor, table: SugarElement<HTMLTableElement>): TableSize => {
  // Note: We can't enforce none (responsive), as if someone manually resizes a table
  // then it must switch to either pixel (fixed) or percentage (relative) sizing
  if (isTablePercentagesForced(editor)) {
    return TableSize.percentageSize(table);
  } else if (isTablePixelsForced(editor)) {
    return TableSize.pixelSize(table);
  } else {
    // Detect based on the table width
    return TableSize.getTableSize(table);
  }
};
