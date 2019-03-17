/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node, PredicateFind, SelectorFind } from '@ephox/sugar';
import Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const addToEditor = (editor: Editor) => {
  const insertToolbarItems = Settings.getInsertToolbarItems(editor);
  if (insertToolbarItems.trim().length > 0) {
    editor.ui.registry.addContextToolbar('quickblock', {
      predicate: (node) => {
        const sugarNode = Element.fromDom(node);
        const textBlockElementsMap = editor.schema.getTextBlockElements();
        const isRoot = (elem) => elem.dom() === editor.getBody();
        return SelectorFind.closest(sugarNode, 'table', isRoot).fold(
          () => PredicateFind.closest(sugarNode, (elem) => {
            return Node.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom());
          }, isRoot).isSome(),
          () => false
        );
      },
      items: insertToolbarItems,
      position: 'line',
      scope: 'editor'
    });
  }
};

export default {
  addToEditor
};