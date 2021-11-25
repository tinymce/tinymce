/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const addToEditor = (editor: Editor): void => {
  const isEditable = (node: Element): boolean => editor.dom.getContentEditableParent(node) !== 'false';
  const isImage = (node: Element): boolean => node.nodeName === 'IMG' || node.nodeName === 'FIGURE' && /image/i.test(node.className);

  const imageToolbarItems = Options.getImageToolbarItems(editor);
  if (imageToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('imageselection', {
      predicate: isImage,
      items: imageToolbarItems,
      position: 'node'
    });
  }

  const textToolbarItems = Options.getTextSelectionToolbarItems(editor);
  if (textToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('textselection', {
      predicate: (node) => !isImage(node) && !editor.selection.isCollapsed() && isEditable(node),
      items: textToolbarItems,
      position: 'selection',
      scope: 'editor'
    });
  }
};

export {
  addToEditor
};
