import { Attribute, PredicateExists, Selectors, SugarElement, SugarNode } from '@ephox/sugar';

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

        return PredicateExists.closest(
          sugarNode,
          (elem) => {
            const isTable = Selectors.is(elem, 'table');
            if (!isTable) {
              return SugarNode.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom) && !Attribute.has(elem, 'data-mce-bogus');
            }
            return isTable;
          },
          isRoot
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
