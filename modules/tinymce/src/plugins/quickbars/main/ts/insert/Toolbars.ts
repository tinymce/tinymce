import { Fun } from '@ephox/katamari';
import { Attribute, PredicateFind, SelectorExists, SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const addToEditor = (editor: Editor): void => {
  const insertToolbarItems = Options.getInsertToolbarItems(editor);
  if (insertToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('quickblock', {
      predicate: (node: Node) => {
        const sugarNode = SugarElement.fromDom(node);
        const textBlockElementsMap = editor.schema.getTextBlockElements();
        const isRoot = (elem: SugarElement<Node>) => elem.dom === editor.getBody();
        const isFakeCaret = (elem: SugarElement<Node>) =>
          Attribute.has(elem, 'data-mce-bogus') || SelectorExists.ancestor(elem, '[data-mce-bogus="all"]', (el: SugarElement<Node>) => isRoot(el));

        return SelectorFind.closest(sugarNode, 'table', isRoot).fold(
          () => PredicateFind.closest(
            sugarNode,
            (elem: SugarElement<Node>) => !isFakeCaret(elem) && SugarNode.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom),
            isRoot
          ).isSome(),
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
