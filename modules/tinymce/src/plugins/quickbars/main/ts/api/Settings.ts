/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as EditorSettings from '../alien/EditorSettings';

const getTextSelectionToolbarItems = (editor: Editor): string => {
  return EditorSettings.getToolbarItemsOr(editor, 'quickbars_selection_toolbar', 'bold italic | quicklink h2 h3 blockquote');
};

const getInsertToolbarItems = (editor: Editor): string => {
  return EditorSettings.getToolbarItemsOr(editor, 'quickbars_insert_toolbar', 'quickimage quicktable');
};

const getImageToolbarItems = (editor: Editor): string => {
  return EditorSettings.getToolbarItemsOr(editor, 'quickbars_image_toolbar', 'alignleft aligncenter alignright');
};

export {
  getTextSelectionToolbarItems,
  getInsertToolbarItems,
  getImageToolbarItems
};
