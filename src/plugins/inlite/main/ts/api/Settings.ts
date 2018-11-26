/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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