import { Fun } from '@ephox/katamari';
import { PredicateFind, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

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
        const isFakeCaret = (elem: SugarElement<Node>) =>
          Attribute.has(elem, 'data-mce-bogus') || SelectorExists.ancestor(elem, '[data-mce-bogus="all"]', (el) => isRoot(el));

        return SelectorFind.closest(sugarNode, 'table', isRoot).fold(
          () => {
            return PredicateFind.closest(
              sugarNode,
              (elem) => {
                return !isFakeCaret(elem) && SugarNode.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom);
              },
              isRoot
            ).isSome();
          },
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
