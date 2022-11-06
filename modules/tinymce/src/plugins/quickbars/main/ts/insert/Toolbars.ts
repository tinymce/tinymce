import { Fun } from '@ephox/katamari';
import { Attribute, PredicateExists, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const addToEditor = (editor: Editor): void => {
  const insertToolbarItems = Options.getInsertToolbarItems(editor);
  if (insertToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('quickblock', {
      predicate: (node) => {
        const sugarNode = SugarElement.fromDom(node);
        const textBlockElementsMap = editor.schema.getTextBlockElements();
        const isRoot = (elem: SugarElement<Node>) => elem.dom === editor.getBody();
        return !Attribute.has(sugarNode, 'data-mce-bogus') && SelectorFind.closest(sugarNode, 'table,[data-mce-bogus="all"]', isRoot).fold(
          () => PredicateExists.closest(
            sugarNode,
            (elem) => SugarNode.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom),
            isRoot
          ),
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
