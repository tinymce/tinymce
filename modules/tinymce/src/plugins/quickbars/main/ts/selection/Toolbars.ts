/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const addToEditor = (editor: Editor) => {
  editor.ui.registry.addContextToolbar('imageselection', {
    predicate: (node) => {
      return node.nodeName === 'IMG' || node.nodeName === 'FIGURE' && /image/i.test(node.className);
    },
    items: 'alignleft aligncenter alignright',
    position: 'node'
  });

  const textToolbarItems = Settings.getTextSelectionToolbarItems(editor);
  if (textToolbarItems.trim().length > 0) {
    editor.ui.registry.addContextToolbar('textselection', {
      predicate: (node) => {
        return !editor.selection.isCollapsed();
      },
      items: textToolbarItems,
      position: 'selection'
    });
  }
};

export default {
  addToEditor
};