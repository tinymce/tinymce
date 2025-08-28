import { TableSize } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

export const get = (editor: Editor, table: SugarElement<HTMLTableElement>): TableSize => {
  // Note: We can't enforce none (responsive), as if someone manually resizes a table
  // then it must switch to either pixel (fixed) or percentage (relative) sizing
  if (Options.isTablePercentagesForced(editor)) {
    return TableSize.percentageSize(table);
  } else if (Options.isTablePixelsForced(editor)) {
    return TableSize.pixelSize(table);
  } else {
    // Detect based on the table width
    return TableSize.getTableSize(table);
  }
};
