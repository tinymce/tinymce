/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { PredicateFind, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Settings from '../api/Settings';

const addToEditor = (editor: Editor): void => {
  const insertToolbarItems = Settings.getInsertToolbarItems(editor);
  if (insertToolbarItems.trim().length > 0) {
    editor.ui.registry.addContextToolbar('quickblock', {
      predicate: (node) => {
        const sugarNode = SugarElement.fromDom(node);
        const textBlockElementsMap = editor.schema.getTextBlockElements();
        const isRoot = (elem: SugarElement<Node>) => elem.dom === editor.getBody();
        return SelectorFind.closest(sugarNode, 'table', isRoot).fold(
          () => PredicateFind.closest(sugarNode, (elem) =>
            SugarNode.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom), isRoot).isSome(),
          Fun.never
        );
      },
      items: insertToolbarItems,
      position: 'line',
      scope: 'editor'
    });
  }
};

export {
  addToEditor
};
