/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Editor } from 'tinymce/core/api/Editor';

import EditorSettings from '../alien/EditorSettings';

const getTextSelectionToolbarItems = function (editor: Editor): string {
  return EditorSettings.getToolbarItemsOr(editor, 'inlite_selection_toolbar', 'bold forecolor italic | form:link-form h2 h3 blockquote');
};

const getInsertToolbarItems = function (editor: Editor): string {
  return EditorSettings.getToolbarItemsOr(editor, 'inlite_insert_toolbar', 'quickimage quicktable');
};

export default {
  getTextSelectionToolbarItems,
  getInsertToolbarItems
};