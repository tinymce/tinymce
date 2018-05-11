/**
 * EditorSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';

const hasAnyRanges = (editor: Editor) => editor.selection.getSel().rangeCount > 0;

export {
  hasAnyRanges
};
