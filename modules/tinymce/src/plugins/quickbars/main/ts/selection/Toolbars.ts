/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const addToEditor = (editor: Editor) => {
  const isEditable = (node) => {
    const editable = editor.dom.getContentEditableParent(node);
    return editable !== 'false';
  }
  const isImage = (node) => node.nodeName === 'IMG' || node.nodeName === 'FIGURE' && /image/i.test(node.className);
  const imageToolbarItems = Settings.getImageToolbarItems(editor);
  if (imageToolbarItems.trim().length > 0) {
    editor.ui.registry.addContextToolbar('imageselection', {
      predicate: isImage,
      items: imageToolbarItems,
      position: 'node'
    });
  }

  const textToolbarItems = Settings.getTextSelectionToolbarItems(editor);
  if (textToolbarItems.trim().length > 0) {
    editor.ui.registry.addContextToolbar('textselection', {
      predicate: (node) => {
        return !isImage(node) && !editor.selection.isCollapsed() && isEditable(node);
      },
      items: textToolbarItems,
      position: 'selection'
    });
  }
};

export default {
  addToEditor
};